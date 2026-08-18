# Orbit Phase 1 Findings Report

**Date:** 2026-08-17  
**Purpose:** Establish the verified operating baseline before backup implementation and 100k-member testing.

## Executive Finding

Orbit is operating on a live Host Africa self-hosted Supabase/PostgreSQL server with all 13 Supabase containers running. The current workload is light and the server has substantial disk capacity. Orbit is not yet proven ready for 100,000 members because backup recovery, firewall exposure, and load capacity have not yet been tested.

## Verified Infrastructure

- Host: `vm515dbpm-supabase.hcloud.app`
- Location: South Africa
- Operating system: Ubuntu 24.04.4 LTS after the approved package upgrade and reboot
- Running kernel after reboot: `6.8.0-137-generic`
- CPU: 4 cores
- Memory: 7.7 GiB RAM
- Swap: 4 GiB, with 364 MiB used at measurement time
- Disk: 193 GB total, 18 GB used, approximately 175 GB available
- Uptime: approximately 29 days, 22 hours
- Load average: approximately 0.43, 0.58, 0.69
- Docker/Supabase containers: 13 running
- Health-reported containers: healthy

## Verified Data Footprint

- Members: 117
- Dependants: 0
- Applications: 0
- Providers: 1,916
- Products: 4
- Claims: 0
- Payment groups: 5
- Users: 14
- Roles: 14
- User-role links: 14
- PostgreSQL `_supabase` database: approximately 670 MB
- PostgreSQL `postgres` database: approximately 18 MB
- Physical PostgreSQL data directory: approximately 790 MB
- Supabase Storage volume: approximately 20 MB

The database data is bind-mounted at `/opt/supabase-project/volumes/db/data`. Docker's managed-volume report does not represent the actual PostgreSQL data size.

Orbit business tables are stored in the `postgres` database. The `_supabase` database is the internal Supabase database and does not contain the Orbit business tables.

## Verified Application and Security Checks

- Local Orbit application returned HTTP 200 at `http://localhost:3001`.
- Required JavaScript and CSS assets returned HTTP 200 after restarting the development server.
- Service-role access to the live database worked.
- Anonymous access returned zero rows for the tested protected tables, including members, providers, applications, claims, roles, and permissions.
- Authenticated staff access was not tested because no staff bearer token was configured locally.
- Current database connections at measurement time: 21 to `_supabase` and 14 to `postgres`.

## Confirmed Risks and Gaps

- No verified PostgreSQL/Supabase backup schedule was found.
- No verified off-server database backup was found.
- No successful restore test has been completed.
- Supabase Storage backup has not been verified.
- Host listeners include ports 5432, 6543, 8000, 8443, and 4000 on all interfaces. Firewall reachability still requires confirmation and policy review.
- The server initially had 62 available package updates and required a restart. The approved upgrade completed successfully; after reboot the server reported 0 available updates.
- One zombie process was reported.
- No load test has been performed.
- The current C5 profile is 4 cores and 7.7 GiB RAM, not the later C9 profile of 16 cores and 64 GiB RAM.
- Firewall inspection completed: Ubuntu UFW remains inactive and the host iptables `INPUT` policy is `ACCEPT`; Docker forwarding rules are present but do not provide a complete host perimeter policy. Host Africa firewall hardening was then applied and verified by the team: SSH is restricted to `175.176.71.2/32`, API port 8000 remains allowed, and public access to ports 5432, 6543, 4000, and 8443 is blocked.

## Server Maintenance Update - 2026-08-17

- Docker and operating-system package upgrades completed without reported package errors.
- The server rebooted successfully into Ubuntu 24.04.4 LTS and kernel `6.8.0-137-generic`.
- Post-reboot verification reported all 13 Supabase containers running.
- Health-checked containers were healthy, including `supabase-db`, `supabase-kong`, `supabase-auth`, `supabase-storage`, `supabase-pooler`, `supabase-analytics`, `supabase-studio`, `supabase-meta`, `supabase-imgproxy`, and Realtime.
- `systemctl is-active docker` returned `active`.
- The post-upgrade system login reported 0 updates available.

This confirms a successful maintenance reboot and a healthy Supabase container stack. It does not by itself prove 100k-member capacity or disaster recovery readiness.

## Post-Maintenance Database Verification - 2026-08-17

- Supabase API gateway returned HTTP 401 to an unauthenticated local request, confirming the gateway is reachable and enforcing authentication.
- PostgreSQL returned `/run/postgresql:5432 - accepting connections`.
- The `_supabase` database measured 674 MB after reboot, with 22 active connections.
- Post-maintenance business-data counts in the `postgres` database matched the baseline: 117 members, 1,916 providers, 0 applications, and 0 claims.
- PostgreSQL buffer-cache hit ratio measured 99.30%.
- `pg_stat_statements` was enabled successfully after confirming it was already present in `shared_preload_libraries`.
- Query statistics currently contain 3,376 tracked query patterns. Overall average mean execution time is 119.65 ms.
- The slowest query with more than five calls averaged 669.07 ms over 28 calls. This is an optimization candidate requiring query identification and plan review before load testing; it is not, by itself, evidence of capacity failure.
- The reboot requirement is cleared and the post-upgrade system reported zero pending package updates.

## Initial Vercel Load Baseline - 2026-08-17

- A read-only HTTP harness was added at `scripts/load-testing/read-only-http-baseline.mjs`. It supports GET requests only and does not create or modify data.
- The Vercel public frontend returned 500/500 HTTP 200 responses at 25 concurrent requests. Measured average latency was 123 ms, p95 was 299 ms, and throughput was 187 requests/sec.
- The read-only `/api/products` endpoint, which exercises the application/database path, returned 100/100 HTTP 200 responses at 10 concurrent requests. Measured average latency was 889 ms, p95 was 1.34 seconds, and throughput was 10.29 requests/sec.
- These tests were run over a slow mobile connection. They are an availability and initial behavior baseline only; final latency/capacity conclusions require reruns from a stable connection.
- No write endpoints, member inserts, policy inserts, claims, or synthetic 100k-member data were used.

## Phase 1 Decision

Phase 1 is substantially complete for infrastructure, security-baseline, backup-copy, maintenance, and initial read-only application verification. The current server is healthy for the present light workload, but no 100k capacity claim should be made yet.

## Approved Next Phase

The remaining Phase 1 closure items and next-phase work are:

1. Rerun the read-only application/database test from a stable network.
2. Restore into the secondary Supabase environment when that environment is available.
3. Record restore time and confirm data integrity.
4. Prepare representative policy/member test data without modifying production business data.
5. Run staged capacity tests, beginning below 10k and increasing toward 100k.

Package upgrades, the maintenance reboot, initial firewall hardening, and backup creation are complete. The remaining next-phase work is restore validation, API/database verification, and controlled capacity testing. No production capacity claim should be made until those tests are measured and recorded.

## Backup Milestone Update - 2026-08-17

- Encrypted `_supabase` PostgreSQL backup created on the C5 server at `/root/altira-backups/20260817T060929Z/supabase.dump.gpg`.
- Backup size: approximately 64 MB.
- Unencrypted dump removed after encryption.
- Decryption test completed without error.
- An independent copy was downloaded to the Windows workstation.
- SHA256 hashes of the server copy and workstation copy matched.

This confirms one verified database backup copy and one independent recovery copy. Supabase Storage documents, automated backup scheduling, and a full restore into the secondary environment remain outstanding.

- Encrypted Supabase Storage archive created from `/opt/supabase-project/volumes/storage`.
- Storage archive size: approximately 20 MB.
- Plaintext storage archive removed after encryption.
- Decryption test completed successfully.
- Independent storage backup copy was downloaded to the Windows workstation.
- SHA256 hashes of the server and workstation storage backup copies matched.

The database and Supabase Storage backup files are now both independently saved and verified. Automated scheduling and restore testing remain outstanding.

- Host Africa VPS-level backup completed successfully.
- Final retained VPS backup size: approximately 4.03 GiB.
- Host Africa backup storage usage: approximately 9% of the 50 GiB allocation.
- Duplicate backup was removed after completion, leaving one retained VPS backup.

The current backup posture now includes an encrypted database copy, an encrypted Supabase Storage copy, and one Host Africa VPS-level backup. Recurring scheduling and restore testing remain outstanding.

- Host Africa automated backup schedule created for Monday and Thursday at 02:00 using Snapshot mode, ZSTD compression, and email notifications.
- The Host Africa schedule UI did not expose a retention or automatic delete/replace setting. Retention/rotation must therefore be confirmed with Host Africa support and monitored against the 50 GiB allocation.

## Firewall Update - 2026-08-17

- Host Africa firewall rules now allow SSH on port 22 from the trusted workstation IP `175.176.71.2/32`.
- Orbit/Supabase API access remains allowed on port 8000.
- Public access was blocked for PostgreSQL port 5432, pooler port 6543, analytics port 4000, and unused gateway port 8443.
- SSH account hardening remains pending: create a non-root administrator with key-based access, test it, then review root/password login policy.
