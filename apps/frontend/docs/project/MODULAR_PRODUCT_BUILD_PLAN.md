# Altira Orbit Modular Product Build Plan

**Status:** Implementation-ready plan  
**Prepared:** September 6, 2026  
**Target start:** September 7, 2026  
**Team:** Four people  
**Initial delivery target:** Sellable Claims/MCO configuration in four weeks  
**Full modular foundation target:** Six weeks

## 1. Executive Decision

Altira Orbit will remain one product and one maintained codebase. It will be sold as fixed product packages made from enabled or disabled modules.

The first release will use a separate deployment and separate Supabase database for each customer. This is the fastest safe route to market and avoids introducing full shared-database tenancy during the first commercial release.

Member-number prefixes remain the member-group identifier. A generic `companies` table is not required for the first release because each customer deployment is isolated. Staff users belong to that deployment through its Supabase Auth and `users` records.

If multiple independent customers are later placed inside one database, prefixes alone will not be sufficient for staff authorization. That future model will require a client record and explicit user-to-client access mapping.

## 2. Product Strategy

Customers buy a business system, not an arbitrary list of dashboards. Altira should sell fixed packages with controlled add-ons.

### 2.1 Mandatory Core

Core is always enabled and cannot be deselected:

- Authentication and session handling
- Staff users, roles and permissions
- Member and product lookup services required by enabled modules
- Audit logging
- Application configuration
- Document/storage access controls
- Health checks and operational logging
- Super-admin module configuration

Core services may support a package without exposing an additional dashboard to the customer.

### 2.2 Initial Packages

| Package | Enabled customer modules | Required internal services | Commercial status |
| --- | --- | --- | --- |
| Orbit Claims/MCO | Claims, Provider, Authorization, Reports | Core, member lookup, products, benefits | Build and sell first |
| Orbit Administration | Admin, Operations, Onboarding, Member, Finance, Call Centre | Core, products, documents | Build second |
| Orbit Funeral Administration | Admin, Operations, Onboarding, Member, Finance, Claims | Core plus funeral policy extension | Requires new funeral workflows |
| Orbit Broker | Broker, Onboarding, Member | Core, products, documents, commission extension | Broker screens must be connected to real data |
| Orbit Full | All supported modules | All core services | Existing full-platform direction |

### 2.3 Add-ons

- Netcash Collections
- Marketing and Affiliate Outreach
- Compliance
- Call Centre
- Advanced Reporting
- Data Import
- Customer branding
- External claims-switch integration

Dependencies must be automatic. For example, Netcash requires member and payment services even if the Member dashboard is not visible.

## 3. Confirmed Current State

The source inspection on September 6, 2026 found:

- 12 planned dashboard roles in `CURRENT_DASHBOARD_ROLES.md`.
- 140 application pages under `apps/frontend/src/app`.
- 99 API routes under `apps/frontend/src/app/api`.
- Role-based navigation is centralized in `src/components/layout/sidebar-layout.tsx`.
- Login landing uses the first assigned role in `src/app/dashboard/page.tsx`.
- API middleware protects selected route prefixes, while many routes perform their own authentication.
- No `dashboard_entitlements`, `dashboard_key`, `company_id` or tenant identifier exists in current application source or migrations.
- Broker leads, policies and commissions contain mock in-memory data.
- Marketing has a working contacts-based dashboard and landing-page API, but campaigns and referrals remain incomplete.
- Seven `/api/netcash/*` routes exist. Current batch generation returns `mode: prepared`; it does not submit instructions to Netcash.
- The current test surface is small relative to 140 pages and 99 APIs.

These facts make a centralized module-access layer necessary. Hiding sidebar items alone is not sufficient.

## 4. Architecture

### 4.1 Deployment Model

For the first commercial release:

```text
One Git repository
        |
        +-- Customer A Vercel deployment -> Customer A Supabase database
        +-- Customer B Vercel deployment -> Customer B Supabase database
        +-- Altira internal deployment   -> Altira Supabase database
```

Each deployment uses the same application commit. Only environment configuration, branding and enabled modules differ.

Do not create permanent customer-specific branches. Customer differences must be configuration, not copied code.

### 4.2 Module Keys

Use stable internal keys:

```text
admin
operations
marketing
broker
compliance
finance
claims
provider
call_centre
authorization
member
onboarding
reports
netcash
data_import
training
```

Keys are permanent API identifiers. Display names may change without changing keys.

### 4.3 Module Registry

Create one code-owned registry containing:

- Module key
- Display name
- Dashboard route prefixes
- API route prefixes
- Allowed RBAC roles
- Required module dependencies
- Whether it is core, customer-facing or an add-on
- Whether it is commercially ready
- Default landing route

Suggested location:

```text
apps/frontend/src/lib/modules/registry.ts
```

Both navigation and access enforcement must use this registry. Do not maintain separate lists in middleware, the sidebar and dashboard redirect code.

### 4.4 Database Model for Isolated Customer Instances

Create `module_entitlements`:

| Column | Type | Rule |
| --- | --- | --- |
| `dashboard_key` | text | Primary key; constrained to supported keys |
| `enabled` | boolean | Not null; default false |
| `configuration` | jsonb | Not null; default empty object |
| `enabled_at` | timestamptz | Set when enabled |
| `enabled_by` | uuid | Nullable reference to `users.id` |
| `created_at` | timestamptz | Not null; default now |
| `updated_at` | timestamptz | Not null; default now |

Create `module_entitlement_audit`:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `dashboard_key` | text | Indexed |
| `old_enabled` | boolean | Previous value |
| `new_enabled` | boolean | New value |
| `changed_by` | uuid | Reference to `users.id` |
| `reason` | text | Required for production changes |
| `created_at` | timestamptz | Indexed timestamp |

Database requirements:

- Enable RLS on both tables.
- Deny anonymous access.
- Allow authenticated system administrators to read entitlements.
- Allow entitlement changes only through a server API after `system_admin` verification.
- Index all foreign keys.
- Use `(dashboard_key, created_at desc)` for audit-history reads.
- Treat a missing entitlement as disabled.
- Seed Core requirements explicitly during deployment.
- Never expose service-role credentials to browser code.

### 4.5 Prefix Handling

Keep member prefixes unchanged. Add a registry only if operational names and validation are needed:

```text
member_prefixes
- prefix
- display_name
- active
- metadata
```

For an isolated customer deployment, all authorized staff can work within that customer's configured dataset unless existing roles restrict them further.

If multiple independent customers share one database later, add:

```text
client_accounts
user_client_access
client_module_entitlements
```

That is a later tenancy project and is outside the first six-week build.

### 4.6 Trial and Paid Account Access

Trial/paid status must be designed into the first modular foundation. The customer-provisioning administrator selects one of two access modes:

```text
Trial account
- 14 calendar days by default
- Selected package/modules enabled
- Demo data only
- Guided onboarding and training enabled
- Automatic expiry
- Manual conversion to paid

Paid account
- Immediate access
- Selected package/modules enabled
- No trial expiry
- Production onboarding enabled
```

This is an access-state feature, not a payment-gateway feature. The first release allows an authorized Altira administrator to record that an account is paid. Automated subscription billing can be added later.

Create singleton `instance_access` for each isolated customer database:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | uuid | Primary key; one active instance record |
| `access_mode` | text | `trial` or `paid` |
| `status` | text | `pending`, `active`, `expired`, `suspended` or `cancelled` |
| `activation_trigger` | text | `immediate` or `first_login` |
| `trial_days` | integer | Default 14; allowed range 1–30 |
| `trial_started_at` | timestamptz | Set once when trial activates |
| `trial_ends_at` | timestamptz | Server-calculated from start time |
| `paid_started_at` | timestamptz | Set when paid access activates |
| `suspended_at` | timestamptz | Nullable |
| `suspension_reason` | text | Required when suspended |
| `demo_data_only` | boolean | Must be true for trial mode |
| `created_by` | uuid | Indexed reference to `users.id` |
| `updated_by` | uuid | Indexed reference to `users.id` |
| `created_at` | timestamptz | Not null; default now |
| `updated_at` | timestamptz | Not null; default now |

Create `instance_access_audit`:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `event_type` | text | Created, activated, extended, converted, expired, suspended or resumed |
| `old_state` | jsonb | Previous access state |
| `new_state` | jsonb | New access state |
| `reason` | text | Required for extension, suspension and conversion |
| `changed_by` | uuid | Indexed reference to `users.id` |
| `created_at` | timestamptz | Indexed timestamp |

Create `onboarding_progress`:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `user_id` | uuid | Indexed reference to `users.id` |
| `task_key` | text | Stable onboarding/training task identifier |
| `status` | text | `not_started`, `in_progress`, `completed` or `skipped` |
| `completed_at` | timestamptz | Nullable |
| `updated_at` | timestamptz | Not null; default now |

Add a unique constraint on `(user_id, task_key)`.

Trial rules:

- Default to `activation_trigger = first_login` so setup time does not consume the customer's trial.
- The first successful customer staff login sets `trial_started_at` and `trial_ends_at` once. Repeated logins must never restart the trial.
- All access checks use server/database time, never browser time.
- Every protected request checks account access before module and role access.
- The request-time access check is authoritative. A scheduled expiry job may update status and send notifications, but access must not depend only on cron execution.
- At seven, three and one day remaining, show an in-app notice and create notification events.
- At expiry, operational modules become unavailable. Login, training, account status and contact/upgrade pages remain available.
- Trial extensions are system-admin only, require a reason and create an audit record.
- Trial users cannot invite unlimited staff, change system security settings, connect production payment credentials or import real member data.
- Demo records must be visibly labelled and isolated in the trial database.
- Trial databases must never contain production member, claim, payment or document data.

Paid/immediate-access rules:

- `access_mode = paid`, `status = active` and `paid_started_at` are set during provisioning.
- The selected package is available immediately after the first login.
- Production onboarding replaces demo onboarding.
- Payment collection for Altira's software subscription is outside the first release; admin approval is the source of truth.

Trial-to-paid conversion:

1. System administrator selects **Convert to paid**.
2. System shows the selected package, modules, users and trial data warning.
3. Administrator records contract/customer reference and reason.
4. Trial demo data is archived or deleted through a separately approved cleanup workflow.
5. Database is verified empty of demo business records before production import.
6. Access changes to paid.
7. Production onboarding and data-import controls become available.
8. Conversion is written to `instance_access_audit`.

Do not automatically copy trial demo records into the paid production dataset.

## 5. Access-Control Flow

Every protected request must follow this order:

```text
1. Authenticate user
2. Confirm account is active and unexpired
3. Resolve requested module
4. Confirm module is enabled
5. Confirm user role/permission
6. Execute business operation
7. Write audit event when required
```

### 5.1 API Enforcement

Create a shared wrapper such as:

```text
withModuleAccess(moduleKey, allowedRoles, handler)
```

All 99 API routes must be classified as:

- Public Core
- Authenticated Core
- Module-owned
- Webhook/cron with separate secret verification
- Development-only and removed from production

Disabled-module behavior:

- Authenticated API request: `403 MODULE_DISABLED`.
- Public route belonging to a disabled product: `404`.
- No query or mutation may run before the module check.

Role checks remain mandatory. An enabled module does not grant a user access to it.

### 5.2 Page Enforcement

The browser must:

- Fetch enabled module keys after authentication.
- Filter sidebar links using module key and role.
- Block direct navigation to disabled dashboards.
- Redirect to the first enabled dashboard for which the user has a valid role.
- Show a clear “module unavailable” screen for an authenticated user.

The API remains the true security boundary. A page guard protects user experience; it does not replace API authorization.

### 5.3 Super-admin Rules

- The module-management page is Core.
- Only `system_admin` may change entitlements.
- Disabling a module requires confirmation and a reason.
- Dependencies are shown before saving.
- Core cannot be disabled.
- Changes create an audit record.
- No silent super-admin bypass of disabled customer modules.
- Emergency bypass, if later required, must be explicit, temporary and audited.

### 5.4 Account Provisioning Screen

Add one system-admin provisioning flow with these required fields:

- Customer display name
- Deployment/environment reference
- Package preset
- Optional add-ons
- Access choice: **14-day trial** or **Paid/immediate access**
- Trial activation: first login by default, with immediate activation as an explicit option
- Initial administrator name and email
- Member-number prefix information
- Branding choice
- Internal contract/customer reference

For trial selection, the screen must show:

- Start trigger
- Calculated expiry date when known
- Demo-data-only warning
- Enabled training/onboarding path
- Restricted production features

For paid selection, the screen must show:

- Immediate activation confirmation
- Selected package and dependencies
- Production onboarding checklist

Provisioning must be transactional or safely resumable. A failure must not leave a customer with authentication but incomplete access configuration.

## 6. Route Ownership

Initial ownership map:

| Module | Page prefixes | API prefixes/services |
| --- | --- | --- |
| Admin | `/admin/*` | `/api/admin/*` |
| Operations | `/operations/*` | `/api/operations/*` |
| Marketing | `/marketing/*`, `/lp/*` | `/api/marketing/*`, `/api/leads`, `/api/public/landing-pages/*` |
| Broker | `/broker/*` | New `/api/broker/*`; selected existing broker services |
| Compliance | `/compliance/*` | `/api/compliance/*` when implemented |
| Finance | `/finance/*` | `/api/finance/*` |
| Claims | `/claims/*`, `/claims-assessor/*` | `/api/claims/*`, `/api/claims-assessor/*` |
| Provider | `/provider/*` | `/api/provider/*` |
| Call Centre | `/call-centre/*` | `/api/call-centre/*` |
| Authorization | `/authorizations/*`, `/ambulance/*` | `/api/authorizations/*`, GOP services |
| Member | `/member/*`, member portal routes | `/api/member/*` |
| Onboarding | `/onboarding/*`, `/apply` | `/api/applications/*`, selected OCR/upload routes |
| Reports | `/reports/*` | Report/query services |
| Netcash | Operations/Finance Netcash screens | `/api/netcash/*` |

Ambiguous shared routes must be recorded in the registry with explicit dependencies. They must not be protected using string-prefix guesses scattered across files.

## 7. Build Schedule

### Week 1: September 7–11 — Safe Clone and Vertical Slice

**Goal:** Prove one dashboard can be safely disabled end-to-end.

Monday:

- Create `modular-platform` Git branch.
- Create a separate working directory/clone if the team needs isolated local environments.
- Clone the Supabase database into staging.
- Create a separate Vercel preview project/environment.
- Record source and clone table counts without copying secrets into documentation.
- Confirm production cannot be reached by staging environment variables.

Tuesday:

- Freeze module keys and package definitions.
- Produce the full 140-page and 99-API ownership inventory.
- Mark public, authenticated, webhook, cron and development-only routes.
- Approve dependency rules.

Wednesday:

- Add the shared module registry.
- Add TypeScript module-key types.
- Add package presets and dependency validation.
- Add unit tests for registry completeness and invalid dependencies.

Thursday:

- Create and apply the entitlement migration to staging only.
- Add RLS, grants, indexes and audit trigger/API behavior.
- Add server-side entitlement reader with default-deny behavior.

Friday:

- Complete one vertical slice using Marketing as the test module.
- Disable Marketing.
- Verify navigation disappears.
- Verify direct page access is blocked.
- Verify `/api/marketing/*` is blocked.
- Re-enable Marketing and verify recovery.
- Demonstrate audit history.

**Week 1 exit criteria:** One module safely toggles on/off in staging without changing production or deleting data.

### Week 2: September 14–18 — Backend Enforcement

- Implement the shared API wrapper.
- Refactor middleware/module mapping to use the registry.
- Classify and protect all module-owned API routes.
- Protect Netcash, upload, OCR, provider, member, cron and webhook exceptions correctly.
- Add tests for disabled API access and role denial.
- Confirm service-role queries cannot run before authentication and module checks.

**Exit criteria:** Every API has an owner and an enforced access classification.

### Week 3: September 21–25 — Frontend and Package Controls

- Load entitlements into authenticated application state.
- Filter the shared sidebar.
- Replace first-role-only dashboard redirect with first-enabled-authorized-module selection.
- Add direct-page module guards.
- Build super-admin module-selection page.
- Add dependency warnings and fixed package presets.
- Add customer branding configuration only if required for the first pilot.
- Add trial/paid selection to the super-admin provisioning flow.
- Add trial countdown, account status and expiry screens.
- Add onboarding/training progress tracking.

**Exit criteria:** A system administrator can select a package and see the correct product surface.

### Week 4: September 28–October 2 — Claims/MCO Pilot

- Configure Claims/MCO preset.
- Verify Claims, Provider and Authorization workflows.
- Verify required member, product, benefit and document services remain available.
- Test all involved page and API routes.
- Test disabled Finance, Marketing, Broker and unrelated dashboards.
- Deploy a preview for internal sales demonstrations.
- Record known workflow gaps separately from module-toggle defects.

**Exit criteria:** Claims/MCO package is demonstrable and technically isolated in staging.

### Week 5: October 5–9 — Administration Package

- Configure Administration preset.
- Verify Admin, Operations, Onboarding, Member, Finance and Call Centre workflows.
- Verify Netcash is independently selectable as an add-on.
- Test package switching without data loss.
- Document onboarding and upgrade procedures.

**Exit criteria:** Two repeatable package presets work from one commit.

### Week 6: October 12–16 — Hardening and Release

- Complete regression matrix for all packages.
- Run authorization-negative tests.
- Run RLS checks in the cloned database.
- Complete backup and restore rehearsal.
- Run representative load tests.
- Add monitoring and module-change alerts.
- Produce sales demo, implementation checklist and support runbook.
- Approve first pilot release.

**Exit criteria:** Release candidate approved for one controlled customer pilot.

## 8. Four-Person Work Allocation

### Person A — Database and Platform

- Staging database clone
- Entitlement schema and migrations
- RLS, indexes and grants
- Entitlement audit history
- Backup/restore verification
- Database performance checks

Primary ownership:

```text
supabase/migrations
database verification scripts
module entitlement data access
```

### Person B — Backend Security

- Module-access wrapper
- API route classification
- Authentication/role/module composition
- Middleware refactor
- Cron/webhook handling
- Negative authorization tests

Primary ownership:

```text
apps/frontend/src/lib/auth-server.ts
apps/frontend/src/middleware.ts
apps/frontend/src/app/api
```

### Person C — Frontend Product Controls

- Module registry client types
- Sidebar filtering
- Landing-route selection
- Direct-page guards
- Super-admin package selector
- Package and dependency UI

Primary ownership:

```text
apps/frontend/src/components/layout
apps/frontend/src/contexts
apps/frontend/src/app/dashboard
new admin module settings page
```

### Person D — QA and Release

- Page/API inventory
- Automated route matrix
- Package regression tests
- Preview deployments
- Pilot test scripts
- Release and rollback checklist
- Documentation

Person D should begin testing on day one, not after development ends.

## 9. Work Estimates

| Workstream | Person-days |
| --- | ---: |
| Clone, environment isolation and verification | 3–5 |
| Module registry and package presets | 4–6 |
| Entitlement schema, RLS and auditing | 5–8 |
| Backend module enforcement | 12–18 |
| Frontend navigation and page enforcement | 8–12 |
| Super-admin package selector | 5–8 |
| Trial/paid access, onboarding and expiry controls | 6–10 |
| Automated route/package tests | 10–15 |
| Pilot deployment, rollback and documentation | 5–8 |
| **Total** | **58–90 person-days** |

With four people, dependencies and review time make the realistic calendar duration four to six weeks. The first working toggle should be demonstrated at the end of week one.

## 10. Product-Specific Development After Modularization

Module selection does not complete unfinished business features.

| Product work | Additional estimate | Main gap |
| --- | ---: | --- |
| Claims/MCO commercial hardening | 3–6 weeks | End-to-end workflow, integrations, operational testing |
| Claims-switch integration | 4–8 weeks after vendor specification | Authentication, contracts, idempotency, callbacks, reconciliation |
| Funeral Administration | 8–12 weeks | Policy lifecycle, beneficiaries, deceased-life claims, lapses/reinstatements |
| Broker | 6–10 weeks | Replace mock screens; commissions, clawbacks and statements |
| Marketing/Affiliate | 6–10 weeks plus compliance review | Campaigns, referral ledger, attribution, consent withdrawal |
| Real Netcash submission | Depends on provider material/access | Mandates, submission, callbacks, reconciliation and retries |

These streams start only after the modular foundation is stable, except for isolated discovery work.

## 11. Testing Matrix

Every module requires these tests:

1. Enabled + valid role: access succeeds.
2. Enabled + invalid role: access denied.
3. Disabled + valid role: access denied.
4. Disabled + direct page URL: blocked.
5. Disabled + direct API URL: blocked before database access.
6. Missing entitlement: disabled.
7. Dependency missing: configuration cannot be saved.
8. Module re-enabled: access recovers without redeployment.
9. Entitlement change: audit event contains actor, time and reason.
10. Package switch: existing business data remains unchanged.
11. Trial starts once on the configured trigger.
12. Trial expiry blocks operational access at request time.
13. Paid/immediate mode never receives a trial expiry.
14. Trial extension and conversion require system-admin access and produce audit records.
15. Trial-to-paid conversion does not carry demo records into production data.

Release testing must include:

- All 140 pages classified and smoke-tested.
- All 99 APIs classified and authorization-tested.
- Member and provider custom authentication paths.
- Service-role routes.
- Upload/OCR routes.
- Cron and webhook secrets.
- Reports and exports.
- Mobile and desktop navigation.
- Trial countdown, expiry and paid-conversion flows.
- Onboarding and training progress.
- Backup and restore.

## 12. First Pilot Acceptance Criteria

The Claims/MCO pilot is acceptable only when:

- One approved commit can deploy Full Orbit and Claims/MCO configurations.
- Disabled dashboards are absent from navigation.
- Disabled pages cannot load protected data.
- Disabled APIs return the defined denial response.
- Claims, Provider and Authorization users retain correct role boundaries.
- Required member/product lookup continues to work.
- Module changes are audited.
- No production data is used in testing.
- Database backup and restore are tested.
- Rollback to the prior application version is documented and rehearsed.
- Known incomplete product workflows are disclosed in the pilot scope.
- Trial instances contain demo data only.
- The administrator can choose trial or paid/immediate access during provisioning.
- Trial expiry is enforced by server time and does not rely only on a scheduled job.

## 13. Release and Rollback

Release sequence:

1. Tag the current production commit.
2. Back up database and Storage.
3. Apply reviewed migration to staging.
4. Run migration verification and RLS checks.
5. Deploy preview.
6. Run package test matrix.
7. Approve pilot.
8. Deploy one customer instance.
9. Monitor errors, latency, database connections and slow queries.

Rollback:

- Re-deploy the tagged prior application commit.
- Keep entitlement migrations additive during the first release.
- Do not drop existing columns or tables.
- Disable new module controls through configuration if required.
- Restore data only when a verified data-corruption event requires it.

## 14. Risks and Controls

| Risk | Control |
| --- | --- |
| Sidebar-only protection | Enforce module access in APIs before queries |
| Role and dashboard confusion | Registry separates module keys from RBAC roles |
| Service-role bypass | Authenticate and authorize before creating/using privileged query path |
| Missing entitlement accidentally enables access | Default deny |
| Permanent customer code forks | One repository; configuration-only deployments |
| Prefix treated as complete authorization | Separate deployment first; explicit tenancy later if shared |
| Package dependency breaks workflows | Registry dependency validation and package tests |
| Broker sold while still mock | Commercial readiness flag blocks release |
| Netcash described as complete | Keep `prepared` state separate from provider submission |
| Marketing used without valid consent | Consent and suppression checks before campaign execution |
| Capacity promised without evidence | Staged 10k, 50k, 100k and later C9 load tests |
| Trial expiry bypassed through direct APIs | Enforce account status before module/role checks on every protected request |
| Trial clock restarted by repeat login | Write start/end once in a transaction and audit the activation |
| Demo data enters production | Separate trial database and mandatory cleanup verification before paid import |

## 15. Decisions Required Before Monday Development Ends

Management must confirm:

1. First pilot package: Claims/MCO.
2. First pilot customer or internal demonstration dataset.
3. Separate database per customer for the first release.
4. Exact modules visible in the Claims/MCO sales package.
5. Whether customer branding is required in the first pilot.
6. Who may change production entitlements.
7. Whether a disabled module returns 403 or a branded unavailable screen.
8. Whether Netcash is excluded from the first Claims/MCO pilot.
9. Whether the first sales pilot begins as a 14-day trial or paid implementation.

Default recommendations:

- Claims/MCO first.
- Separate database per customer.
- Branding after the first vertical slice.
- Entitlement changes restricted to Altira `system_admin` users.
- Netcash excluded until real submission and reconciliation are complete.
- Trials start on first successful customer staff login.
- Trial mode remains demo-data-only and converts through an audited admin action.

## 16. Definition of Done

The modular-platform project is complete when Altira can deploy at least two different fixed product packages from the same commit, configure modules without code changes, enforce disabled modules at both page and API boundaries, preserve role restrictions, audit configuration changes, provision either a 14-day trial or paid/immediate account, enforce trial expiry, track onboarding/training progress, convert a trial safely, and reproduce the deployment for a new customer.
