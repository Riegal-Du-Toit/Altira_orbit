# Supabase Connection Summary - Altira Orbit

## Status

Supabase/PostgreSQL is used for auth-backed data access, application data, and storage-backed document flows.

## Environment Variables

Tracked documentation must use placeholders only:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
PLUS1_SUPABASE_URL=your_plus1_supabase_url
PLUS1_SUPABASE_SERVICE_ROLE_KEY=your_plus1_server_only_service_role_key
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account_json_outside_repo
```

Real values belong in local `.env.local` files or deployment secret stores, not in docs.

## Documentation Location

Current infrastructure direction is documented in `apps/frontend/docs/project/CURRENT_INFRASTRUCTURE.md`.
Supabase migrations and operational helpers live in `supabase/`.

## Quick Test

```bash
cd supabase
node test-connection.js
```

Only run connection checks against the intended environment. `apps/frontend/.env` and `apps/frontend/.env.local` may point at different Supabase databases.

## Database Shape

Core tables:

- `contacts` - master record for leads, applicants, and members
- `applications` - application data linked to contacts
- `members` - active member records
- `application_dependents` and `member_dependants`
- `contact_interactions` and `popia_audit_log`
- `users`, `roles`, `permissions`
- `claims`, `providers`, `products`, `brokers`
- `hospital_claim_intakes`, `hospital_claims_register`, and related hospital-claims tables

## Security Notes

- Never commit service-role keys.
- Never put service-role keys in frontend code.
- Keep service-account JSON files outside the repo.
- Rotate any key that was committed or shared.
