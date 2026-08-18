# Phase 1: 100k Readiness Baseline

**Measurement date:** 2026-08-17 05:07 UTC  
**Scope:** Read-only baseline for the first 100,000-member capacity target.  
**Claims scope:** Claims processing is excluded from the first commercial capacity target.

## Current Architecture

- Application: Next.js frontend delivered through Vercel.
- Database platform: self-hosted Supabase/PostgreSQL on the Host Africa server.
- Supporting data services: Supabase authentication and storage-backed application documents.
- Source code: GitHub repository with Vercel deployment history.
- Test/recovery environment: separate Supabase clone documented, but not yet verified as an automated failover target.

## Live Database Snapshot

Counts were collected through read-only Supabase count queries using the configured server-side connection. No rows were read into the report and no data was changed.

| Table | Rows | Count query time |
| --- | ---: | ---: |
| members | 117 | 1,901 ms |
| member_dependants | 0 | 1,093 ms |
| applications | 0 | 827 ms |
| providers | 1,916 | 1,204 ms |
| products | 4 | 1,692 ms |
| claims | 0 | 1,091 ms |
| payment_groups | 5 | 1,094 ms |
| users | 14 | 1,639 ms |
| roles | 14 | 1,251 ms |
| user_roles | 14 | 1,270 ms |

The `payments` and `audit_logs` count queries returned no count because those tables were not exposed to the configured count request. This is not treated as zero; their exposure and schema must be checked separately.

## Application Baseline

The local application was tested five times at `http://localhost:3001`:

- HTTP result: 200 on all five requests
- Fastest response: 185 ms
- Slowest response: 394 ms
- Average response: 249 ms

These are local development measurements only. They are not production performance measurements and must not be used as the 100k capacity result.

## Current Findings

- The live database connection is working.
- Direct RLS verification completed at 2026-08-17 05:11 UTC: service-role access returned the expected live counts, while anonymous access returned zero rows for users, roles, permissions, members, dependants, claims, providers, and applications.
- Authenticated staff access was not tested because no `RLS_TEST_STAFF_BEARER_TOKEN` is configured in the local environment.
- The current data volume is far below the 100k test target.
- The application can start and serve the main page locally after dependencies are installed.
- Direct Host Africa/SSH inspection completed at 2026-08-17 07:43 SAST: the server reports 4 CPU cores, 7.7 GiB RAM, 193 GB root disk, 10% disk usage, 52% system memory usage, 4 GB swap with 364 MB used, and 29 days of uptime.
- Current load was low at approximately 0.43, 0.58, and 0.69. All 13 Supabase containers were running, and the health-reported containers were healthy.
- Direct PostgreSQL inspection completed: `_supabase` is approximately 670 MB and `postgres` is approximately 18 MB. Orbit business tables (`members`, `providers`, `applications`, and `claims`) are in the `postgres` database; `_supabase` is the internal Supabase database. PostgreSQL reported 21 connections to `_supabase` and 14 to `postgres` at measurement time.
- PostgreSQL data is bind-mounted from `/opt/supabase-project/volumes/db/data`; Docker's local-volume report does not include this database data directory.
- Physical storage inspection completed: `/opt/supabase-project/volumes/db/data` uses approximately 790 MB and the Supabase Storage volume uses approximately 20 MB. The database and document footprint is currently very small relative to the server's 175 GB available root disk.
- Post-maintenance database verification completed: the `_supabase` database is 674 MB, with 22 active connections and a 99.30% buffer-cache hit ratio.
- Post-maintenance business-data verification completed in the `postgres` database: 117 members, 1,916 providers, 0 applications, and 0 claims. These values match the original baseline.
- `pg_stat_statements` was enabled after confirming it was already preloaded. It is tracking 3,376 query patterns; aggregate mean execution time is 119.65 ms, with one frequently executed query averaging 669.07 ms across 28 calls. Query identity and execution plan require review before capacity testing.
- Controlled Vercel read-only baseline completed: the public frontend returned 500/500 HTTP 200 responses at 25 concurrent requests, with 123 ms average latency, 299 ms p95 latency, and 187 requests/sec.
- Controlled Vercel product/database baseline completed: `/api/products` returned 100/100 HTTP 200 responses at 10 concurrent requests, with 889 ms average latency, 1.34 seconds p95 latency, and 10.29 requests/sec.
- The Vercel tests were run over a slow mobile connection. They confirm successful application responses, but their latency and throughput are not suitable as final server-capacity measurements. Stable-network reruns are required.
- A production database backup schedule and tested restore were not evidenced. `/var/backups` contained operating-system package backups, not PostgreSQL or Supabase data backups. No `pg_dump`, `restic`, or `rclone` backup references were found in the checked cron, systemd, and root locations.
- The operating system and Docker packages were upgraded successfully. The server was rebooted and is now running Ubuntu 24.04.4 LTS with kernel `6.8.0-137-generic`; the post-upgrade login reported zero pending package updates. One zombie process was reported during the earlier baseline and should be rechecked.
- Public listeners include ports 5432, 6543, 8000, 8443, and 4000. The database/pooler and analytics listeners require an explicit firewall and access-policy review before production use.
- No load testing has been performed yet.

## Phase 1 Completion Requirements

The following measurements remain outstanding before the baseline is complete:

1. Record C5 CPU, RAM, disk capacity, disk usage, disk I/O, and network usage.
2. Record PostgreSQL database size, active connections, cache hit rate, and slow-query activity.
3. Confirm where Supabase Storage files are physically stored and how they are backed up.
4. Confirm the current Vercel production deployment and environment configuration.
5. Confirm whether the secondary Supabase clone is current and can be restored.
6. Complete a restore test of the encrypted database backup in the secondary Supabase environment.

7. Run controlled load and capacity tests against a representative dataset.

## Baseline Decision

The system is substantially through Phase 1 baseline verification, but it is not yet proven ready for 100,000 members. Core server maintenance, encrypted backup creation, independent backup-copy verification, Host Africa VPS backup creation, initial firewall hardening, API verification, and a first read-only application/database load baseline are complete. Stable-network reruns, restore validation, secondary-environment confirmation, and representative 100k-member capacity testing remain open.
