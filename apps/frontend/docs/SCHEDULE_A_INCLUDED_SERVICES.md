# Altira Management Services Agreement
## Schedule A - Included Services & Existing Features

**Review basis:** repository inspection and read-only inspection of the configured Altira Supabase project at `http://169.255.59.149:8000`.

**Scope rule:** this is a concise operational scope summary. Statuses describe what is present in code and, where checked, the live database. No functionality has been inferred from documentation alone.

**Explicit exclusion:** the recently added funnel builder and landing-page builder are excluded from this Schedule A and from all totals below. The public application process at `/apply` remains included.

## Status key

- **Operational:** implemented route/API/workflow is present and connected to its intended data path.
- **Partial:** some implementation is present, but a required dependency, workflow step, data set, or supporting service is incomplete.
- **Placeholder:** the page is present but explicitly says it is coming soon, under development, or otherwise does not provide the stated service.
- **Not evidenced:** the repository did not provide enough evidence to include the service as operational.

## Infrastructure

Department: Infrastructure  
Feature: Application hosting  
Description: Next.js frontend configured for Vercel deployment, with the primary application under `apps/frontend`.  
Current Status: Operational  
Included in Management: YES

Department: Infrastructure  
Feature: Database  
Description: Supabase/PostgreSQL application database accessed through Supabase clients and server-side API routes.  
Current Status: Operational  
Included in Management: YES

Department: Infrastructure  
Feature: Authentication  
Description: Staff authentication through Supabase-backed user records and role loading; member login through the member login API; provider and portal access paths are present.  
Current Status: Partial  
Included in Management: YES

Department: Infrastructure  
Feature: Role-based access control  
Description: Dashboard navigation and backend access checks use users, roles, permissions, and user-role links.  
Current Status: Operational  
Included in Management: YES

Department: Infrastructure  
Feature: File storage  
Description: Application and claim documents, signatures, voice recordings, and related files are uploaded through the application storage API.  
Current Status: Partial  
Included in Management: YES

Department: Infrastructure  
Feature: Security and row-level access  
Description: Supabase RLS containment migrations and staff/provider/member policies are present.  
Current Status: Operational  
Included in Management: YES

Department: Infrastructure  
Feature: Logging and audit trail  
Description: Audit routes and audit-related database tables are present for system activity and claim activity.  
Current Status: Partial  
Included in Management: YES

Department: Infrastructure  
Feature: Scheduled jobs  
Description: A protected pre-authorisation expiry notification endpoint exists and expects a cron secret.  
Current Status: Partial  
Included in Management: YES

Department: Infrastructure  
Feature: Backups and monitoring  
Description: No repository evidence was found for a managed backup schedule or dedicated production monitoring service.  
Current Status: Not evidenced  
Included in Management: YES

Department: Infrastructure  
Feature: Application APIs  
Description: Next.js API routes cover administration, operations, claims, providers, members, finance, authorisations, marketing, OCR, uploads, and notifications.  
Current Status: Partial  
Included in Management: YES

## Application and Onboarding Process

Department: Onboarding  
Feature: New member application flow  
Description: Multi-step application process covering personal details, identity documents, proof of address, selfie, dependants, medical history, review and terms, and banking details.  
Current Status: Operational  
Included in Management: YES

Department: Onboarding  
Feature: Application document capture  
Description: Application documents, signature, voice recording, and related evidence can be prepared for upload and stored with the application.  
Current Status: Partial  
Included in Management: YES

Department: Onboarding  
Feature: Application review  
Description: Onboarding and administration pages provide application queues, application details, document review, terms acceptance review, and decision fields.  
Current Status: Operational  
Included in Management: YES

Department: Onboarding  
Feature: Application confirmation  
Description: Application submission and confirmation API routes are present.  
Current Status: Partial  
Included in Management: YES

## Administration

Department: Administration  
Feature: Admin dashboard  
Description: System overview with member, policy, claim, pre-authorisation, provider, broker, activity, alert, and approval metrics.  
Current Status: Operational  
Included in Management: YES

Department: Administration  
Feature: Member administration  
Description: Member search, filtering, viewing, editing, plan changes, dependant access, and member detail management.  
Current Status: Partial  
Included in Management: YES

Department: Administration  
Feature: Broker administration  
Description: Broker listing, search, creation, editing, status management, and broker detail API routes.  
Current Status: Partial  
Included in Management: YES

Department: Administration  
Feature: Provider administration  
Description: Provider directory, provider details, provider creation, editing, status fields, and provider account creation route.  
Current Status: Operational  
Included in Management: YES

Department: Administration  
Feature: Product and policy configuration  
Description: Product creation, editing, benefits, policy sections, pricing fields, limits, exclusions, conditions, network information, and procedure codes.  
Current Status: Partial  
Included in Management: YES

Department: Administration  
Feature: Group setup  
Description: Group and payment-group administration surfaces are present.  
Current Status: Partial  
Included in Management: YES

Department: Administration  
Feature: Data import  
Description: Upload and import routes support structured data imports, including member and provider workflows.  
Current Status: Partial  
Included in Management: YES

Department: Administration  
Feature: System audit  
Description: Admin audit page and audit API provide an activity review surface.  
Current Status: Partial  
Included in Management: YES

Department: Administration  
Feature: Rules and PMB configuration  
Description: Admin routes and pages exist for rules, PMB, and regime-related configuration.  
Current Status: Partial  
Included in Management: YES

## Operations

Department: Operations  
Feature: Operations dashboard  
Description: Operational overview for debit orders, provider applications, arrears, member queries, claims, broker requests, and uptime indicators.  
Current Status: Operational  
Included in Management: YES

Department: Operations  
Feature: Member operations  
Description: Member search, member details, bulk upload, group membership, and operational member maintenance.  
Current Status: Partial  
Included in Management: YES

Department: Operations  
Feature: Provider operations  
Description: Provider directory and provider detail workflows for operations staff.  
Current Status: Operational  
Included in Management: YES

Department: Operations  
Feature: Payment groups and collection calendar  
Description: Payment-group management, group members, collection dates, and collection calendar pages.  
Current Status: Partial  
Included in Management: YES

Department: Operations  
Feature: Debit-order operations  
Description: Debit-order listing, daily debit-order view, run workflow, and arrears management surfaces.  
Current Status: Partial  
Included in Management: YES

Department: Operations  
Feature: Operational reports and communications  
Description: Operations reporting, broker communications, claims oversight, and call-centre access points.  
Current Status: Partial  
Included in Management: YES

## Marketing

Department: Marketing  
Feature: Marketing dashboard  
Description: Marketing overview with lead, campaign, activity, quick-action, and performance sections.  
Current Status: Partial  
Included in Management: YES

Department: Marketing  
Feature: Content library  
Description: Marketing content/template library with search and content management surfaces.  
Current Status: Partial  
Included in Management: YES

Department: Marketing  
Feature: Lead scoring  
Description: Scoring model configuration, score distribution, factors, and assignment-rule surfaces.  
Current Status: Partial  
Included in Management: YES

Department: Marketing  
Feature: Marketing workflows  
Description: Workflow templates, channels, status, and trigger activity surfaces for email, SMS, WhatsApp, and voice concepts.  
Current Status: Partial  
Included in Management: YES

Department: Marketing  
Feature: Marketing onboarding and budget views  
Description: Onboarding pipeline, budget/ROI, consent, referrals, reports, and analytics routes exist.  
Current Status: Partial  
Included in Management: YES

## Broker Portal

Department: Broker Portal  
Feature: Broker dashboard  
Description: Broker overview and broker-specific navigation.  
Current Status: Operational  
Included in Management: YES

Department: Broker Portal  
Feature: Broker applications and leads  
Description: Application viewing, lead capture, lead search, and lead detail forms.  
Current Status: Partial  
Included in Management: YES

Department: Broker Portal  
Feature: Broker policies and quotes  
Description: Policy listing and quote workflow surfaces.  
Current Status: Partial  
Included in Management: YES

Department: Broker Portal  
Feature: Broker commissions  
Description: Commission listing and statement/period filtering surface.  
Current Status: Partial  
Included in Management: YES

## Member Portal

Department: Member Portal  
Feature: Member dashboard  
Description: Member landing dashboard with member overview and portal navigation.  
Current Status: Partial  
Included in Management: YES

Department: Member Portal  
Feature: Member profile and dependants  
Description: Member profile, dependant management, and member information views.  
Current Status: Partial  
Included in Management: YES

Department: Member Portal  
Feature: Member benefits and usage  
Description: Benefit viewing and benefit-usage API routes.  
Current Status: Partial  
Included in Management: YES

Department: Member Portal  
Feature: Member claims  
Description: Claim listing and claim submission routes, including claim document handling.  
Current Status: Partial  
Included in Management: YES

Department: Member Portal  
Feature: Member documents and payments  
Description: Member document and payment pages are present.  
Current Status: Partial  
Included in Management: YES

## Finance

Department: Finance  
Feature: Finance dashboard  
Description: Revenue, outstanding payments, reconciliation status, journal-entry metrics, and recent transactions.  
Current Status: Operational  
Included in Management: YES

Department: Finance  
Feature: Payment batches  
Description: Payment-batch listing, generation, validation of invalid banking details, batch summary, and batch detail views.  
Current Status: Partial  
Included in Management: YES

Department: Finance  
Feature: Payment groups and member finance views  
Description: Group list and finance member list with search/filter surfaces.  
Current Status: Partial  
Included in Management: YES

Department: Finance  
Feature: Ledger, reconciliation, journal entries, and reports  
Description: Pages exist for general ledger, bank reconciliation, journal entries, and financial reports.  
Current Status: Placeholder  
Included in Management: YES

## Compliance

Department: Compliance  
Feature: Compliance dashboard  
Description: Compliance overview and compliance navigation.  
Current Status: Operational  
Included in Management: YES

Department: Compliance  
Feature: POPIA and data requests  
Description: POPIA management and data-subject request surfaces.  
Current Status: Partial  
Included in Management: YES

Department: Compliance  
Feature: Complaints, breaches, and registers  
Description: Complaint management, breach tracking, compliance register, and related forms.  
Current Status: Partial  
Included in Management: YES

Department: Compliance  
Feature: Compliance reports and vendors  
Description: Compliance reporting and vendor management pages.  
Current Status: Partial  
Included in Management: YES

## Claims

Department: Claims  
Feature: Claims dashboard and queue  
Description: Claims overview, queue, claim detail, and status-oriented work surfaces.  
Current Status: Operational  
Included in Management: YES

Department: Claims  
Feature: Claims adjudication  
Description: Claim and claim-line adjudication, approval, rejection, notes, and approved-amount workflows.  
Current Status: Partial  
Included in Management: YES

Department: Claims  
Feature: Hospital claims workspace  
Description: Hospital intake, register, claims, documents, payments, audit, history, and calculation-rule database structures and routes.  
Current Status: Partial  
Included in Management: YES

Department: Claims  
Feature: Fraud review  
Description: Fraud case listing, search, investigation findings, and fraud-related API routes.  
Current Status: Partial  
Included in Management: YES

Department: Claims  
Feature: Claims documents and benefit validation  
Description: Claim document upload and benefit eligibility/validation workflow.  
Current Status: Partial  
Included in Management: YES

## Providers

Department: Providers  
Feature: Provider dashboard  
Description: Provider details, claim metrics, pending claims, approved amounts, and recent claims.  
Current Status: Operational  
Included in Management: YES

Department: Providers  
Feature: Provider eligibility lookup  
Description: Member lookup, policy information, coverage summary, benefit details, and covered dependants.  
Current Status: Operational  
Included in Management: YES

Department: Providers  
Feature: Provider claim submission and history  
Description: Member lookup, claim type, claim details, benefit check, required documents, submission, and claim history.  
Current Status: Partial  
Included in Management: YES

Department: Providers  
Feature: Provider pre-authorisation  
Description: Patient, procedure, clinical information, supporting documents, submission, and request history.  
Current Status: Partial  
Included in Management: YES

Department: Providers  
Feature: Provider payment/remittance view  
Description: Provider payment history, filtering, remittance advice, and payment information surfaces.  
Current Status: Partial  
Included in Management: YES

## Call Centre

Department: Call Centre  
Feature: Call-centre dashboard  
Description: Call-centre overview and navigation for support operations.  
Current Status: Operational  
Included in Management: YES

Department: Call Centre  
Feature: Member and application lookup  
Description: Member search, application access, and member/application detail routes.  
Current Status: Partial  
Included in Management: YES

Department: Call Centre  
Feature: Support and tickets  
Description: Support page, ticket page, knowledge page, and case-oriented workflow surfaces.  
Current Status: Partial  
Included in Management: YES

Department: Call Centre  
Feature: Dependant and upgrade verification  
Description: Structured verification forms with notes and rejection reasons for dependant and upgrade requests.  
Current Status: Partial  
Included in Management: YES

## Authorisations

Department: Authorisations  
Feature: Authorisation dashboard  
Description: Authorisation workspace and history navigation.  
Current Status: Operational  
Included in Management: YES

Department: Authorisations  
Feature: Member verification  
Description: Verification by member name, ID number, member number, and cellphone number.  
Current Status: Operational  
Included in Management: YES

Department: Authorisations  
Feature: Ambulance and hospital benefits  
Description: Separate ambulance and hospital benefit workspaces for authorisation users.  
Current Status: Partial  
Included in Management: YES

Department: Authorisations  
Feature: GOP intake  
Description: Guarantee-of-payment intake fields for Africa Assist workflows.  
Current Status: Partial  
Included in Management: YES

## Onboarding

Department: Onboarding  
Feature: Onboarding dashboard  
Description: Onboarding landing page and application pipeline access.  
Current Status: Operational  
Included in Management: YES

Department: Onboarding  
Feature: Application verification workspace  
Description: Detailed applicant, documents, terms acceptance, review, and decision views.  
Current Status: Operational  
Included in Management: YES

## CRM

Department: CRM  
Feature: Contact and lead records  
Description: Contacts, leads, lead capture, contact interactions, and marketing lead APIs are present across the application.  
Current Status: Partial  
Included in Management: YES

Department: CRM  
Feature: Standalone CRM dashboard  
Description: No standalone CRM dashboard or complete CRM case-management route was found.  
Current Status: Not evidenced  
Included in Management: YES

## Reporting & Analytics

Department: Reporting & Analytics  
Feature: Reporting dashboard  
Description: Reporting dashboard, operational reports, regulatory reports, query-builder route, and scheduled-report route are present.  
Current Status: Partial  
Included in Management: YES

Department: Reporting & Analytics  
Feature: Department dashboards and metrics  
Description: Admin, operations, marketing, finance, claims, provider, compliance, broker, call-centre, authorisation, and member dashboard metric surfaces.  
Current Status: Partial  
Included in Management: YES

## Document Management

Department: Document Management  
Feature: Application documents  
Description: Identity, address, selfie, signature, voice, and terms-related document references are handled in the application process.  
Current Status: Partial  
Included in Management: YES

Department: Document Management  
Feature: Claim documents  
Description: Claim invoices, prescriptions, clinical documents, and supporting files have upload and review paths.  
Current Status: Partial  
Included in Management: YES

Department: Document Management  
Feature: Member and policy documents  
Description: Member document and policy/brochure viewing routes are present.  
Current Status: Partial  
Included in Management: YES

## Notifications

Department: Notifications  
Feature: Application confirmation  
Description: Confirmation API route exists for submitted applications.  
Current Status: Partial  
Included in Management: YES

Department: Notifications  
Feature: Pre-authorisation expiry notifications  
Description: Protected API endpoint exists for expiry notification processing.  
Current Status: Partial  
Included in Management: YES

Department: Notifications  
Feature: GOP notifications  
Description: GOP notification API route is present.  
Current Status: Partial  
Included in Management: YES

Department: Notifications  
Feature: SMS/WhatsApp/voice delivery  
Description: Channel concepts and notification code references exist, but an active delivery-provider integration was not evidenced.  
Current Status: Not evidenced  
Included in Management: YES

## User Management

Department: User Management  
Feature: Staff users  
Description: User records, active state, email verification fields, login, current-user lookup, and logout flows are present.  
Current Status: Operational  
Included in Management: YES

Department: User Management  
Feature: Provider account setup  
Description: Administration route exists to create a provider account.  
Current Status: Partial  
Included in Management: YES

Department: User Management  
Feature: Member access  
Description: Member login and member session/API access paths are present.  
Current Status: Partial  
Included in Management: YES

## Role Permissions

Department: Role Permissions  
Feature: Dashboard roles  
Description: Admin, Operations, Marketing, Broker, Compliance, Finance, Claims, Provider, Call Centre, Authorisation, Member, and Onboarding dashboard experiences are implemented in navigation and routes.  
Current Status: Operational  
Included in Management: YES

Department: Role Permissions  
Feature: Database RBAC  
Description: Live database contains roles, permissions, and user-role links; the inspected project contained 14 roles, 32 permissions, and 14 user-role links.  
Current Status: Operational  
Included in Management: YES

## Settings

Department: Settings  
Feature: Profile and consent surfaces  
Description: Profile and consent pages are present.  
Current Status: Partial  
Included in Management: YES

Department: Settings  
Feature: Standalone system settings  
Description: No standalone settings administration page was evidenced in the application routes.  
Current Status: Not evidenced  
Included in Management: YES

## Integrations

Department: Integrations  
Feature: Supabase  
Description: Database, authentication, storage, and server-side data access use Supabase clients and APIs.  
Current Status: Operational  
Included in Management: YES

Department: Integrations  
Feature: Google Vision/OCR  
Description: OCR routes and application-step document extraction flows reference Google Vision AI.  
Current Status: Partial  
Included in Management: YES

Department: Integrations  
Feature: Netcash  
Description: Banking/debit-order documentation and application banking references exist; a complete active Netcash API route was not evidenced in the inspected route tree.  
Current Status: Not evidenced  
Included in Management: YES

Department: Integrations  
Feature: Email, SMS, WhatsApp, and voice providers  
Description: Application and marketing channels are represented in the UI/code, but active external provider credentials or a complete delivery integration were not evidenced.  
Current Status: Not evidenced  
Included in Management: YES

## Additional Departments Discovered

Department: Public Application  
Feature: Public application entry and submission confirmation  
Description: Public application entry, application steps, and submitted confirmation page.  
Current Status: Operational  
Included in Management: YES

Department: Public Member Access  
Feature: Member login entry  
Description: Member login route and member portal entry path.  
Current Status: Partial  
Included in Management: YES

## Excluded From Monthly Management

The following are excluded from this Schedule A:

- Funnel builder at `/marketing/campaigns`.
- New funnel/campaign builder route at `/marketing/campaigns/new`.
- Landing-page builder at `/marketing/landing-pages`.
- Public generated funnel route at `/lp/[slug]`.
- Funnel builder components under `apps/frontend/src/components/funnel`.
- Marketing analytics, lead management, referral management, financial reports, bank reconciliation, and general ledger pages where the page explicitly displays “Coming Soon” or “under development”.
- Any feature identified in code as TODO, planned, prototype, or future enhancement.
- Any external integration for which an active provider configuration was not evidenced.
- Any capability that exists only in documentation, sample data, mock data, or a design placeholder and is not connected to an operational workflow.

## Live Database Snapshot

The read-only inspection of the configured Altira Supabase project found:

- Providers: **1,916** rows.
- Users: **14** rows.
- Roles: **14** rows.
- Permissions: **32** rows.
- User-role links: **14** rows.
- Landing-pages table: **1** row; landing-page/funnel functionality is excluded above.
- Members: **0** rows.
- Applications: **0** rows.
- Claims: **0** rows.
- Products: **0** rows.
- Brokers: **0** rows.
- Payment groups and payment batches: **0** rows in the queried tables.

These counts describe the database at review time. They do not convert an empty table into an excluded feature when the corresponding application workflow exists in code; they do mean that the live data set does not currently demonstrate populated operation for that area.

## Scope Summary

Counting method: dashboard roles are counted from the current dashboard-role reference; pages are counted from Next.js `page.tsx` route files; builder routes are removed from the page count; features are counted as the feature groups listed in this Schedule A; automations and integrations count only distinct implemented or explicitly evidenced mechanisms.

- Total Departments / dashboard or portal areas: **12**.
- Total Dashboard Roles: **12**.
- Total Page Route Files Reviewed: **140**.
- Funnel/landing builder route files excluded: **4**.
- Total Page Route Files Remaining in Scope: **136**.
- Total Included Feature Groups: **95**.
- Total Automation Mechanisms Evidenced: **3** (application confirmation, pre-authorisation expiry notification endpoint, GOP notification endpoint).
- Total Integrations Evidenced in Code or Configuration: **2** (Supabase and Google Vision/OCR); Netcash and outbound messaging providers are not counted as active integrations.
- Total Code-Referenced Database Tables Reviewed: **33**.
- Total Code-Referenced Tables with accessible live counts: **30**; three referenced names returned no usable count or were not available through the inspected API path.
- Total Live Database Tables with non-zero counts among those queried: **7**.

This Schedule A should be reviewed against the final production deployment and executed service-provider configuration before being attached to a signed agreement.
