# Migration workflow

**INF-003.** Prisma under `packages/db` is the schema source of truth. Supabase hosts Postgres.

## Layout

```
packages/db/prisma/schema/
  schema.prisma          # generator + datasource
  app-meta.prisma        # INF baseline (`app_meta`)
  enums.prisma           # BE-001
  config.prisma          # BE-019
  identities.prisma      # BE-002 / BE-003 / BE-055 (StaffMember.coach) + #298 roleId + #344 Profile identity
  roles.prisma           # #298 staff_role_definitions / permission_definitions
  catalogue.prisma       # BE-004 / BE-005 / BE-006 / BE-055 (Coach.staffMemberId)
  policies.prisma        # BE-007
  reservations.prisma    # BE-008…BE-015 / BE-056 (PaymentQrCode)
  audit.prisma           # BE-016
  bundles.prisma         # BE-058 session packages
  events.prisma          # #319 SessionEvent
  onboarding.prisma      # #344 ProfileOnboarding / ProfileClassInterest
packages/db/prisma/migrations/
  migration_lock.toml
  YYYYMMDDHHMMSS_<ticket>_<verb>_<object>/
    migration.sql
```

## Prisma conventions (contributor contract)

Apply on every model from BE-001 onward:

- Declare **both sides** of every relation with `@relation`.
- `@id @default(cuid())` (string) or `@id @default(autoincrement())` (int).
- `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` on every model.
- `@@index` on frequently queried columns.
- `@unique` / `@@unique` for business-unique fields.
- Enable **RLS** on every table in an exposed schema (`public`) in the SQL migration. Policies belong with the BE ticket that defines access — do not leave new tables without RLS.

## Naming

`YYYYMMDDHHMMSS_<ticket>_<verb>_<object>`

Examples: `20260919090000_inf003_create_app_meta`, `20261001120000_be006_create_sessions`.

Use UTC. One concern per migration.

## Commands

| Action | Command | Where |
| --- | --- | --- |
| Create (review SQL first) | `pnpm --filter @balanse/db db:migrate:create -- --name <ticket>_<verb>_<object>` | Local, with `DIRECT_URL` |
| Create + apply locally | `pnpm --filter @balanse/db db:migrate` | Prefer a local Postgres / `supabase start` if you must iterate; the hosted project is shared |
| Generate client | `pnpm --filter @balanse/db db:generate` | Always after schema changes |
| Inspect status | `pnpm --filter @balanse/db db:status` | Compares `_prisma_migrations` |
| Roll forward (shared project) | `pnpm --filter @balanse/db db:deploy` | After PR review. Uses `DATABASE_URL`/`DIRECT_URL` for `xydundrayuusqizssgby` |
| Studio | `pnpm --filter @balanse/db db:studio` | Local |

Prisma records history in `public._prisma_migrations`. The same SQL is also applied through Supabase migration history for INF-003/004 so `list_migrations` on the project matches.

## Review checklist (required on every schema PR)

- [ ] **Destructive-change flag:** Does this DROP/ALTER in a way that deletes or retypes data? If yes, call it out in the PR title (`feat(db)!: …`) and include a backfill plan.
- [ ] **Index review:** New filters/joins have `@@index` / `@@unique` as needed; unused indexes are not added “just in case”.
- [ ] **RLS impact:** Table is RLS-enabled; policies match the access model. Views use `security_invoker` (Postgres 15+). No `user_metadata` in JWT authz — use `app_metadata` / tables (`BE-003`).
- [ ] **Does this rewrite history?** Changing coach rates, session snapshots, refunds, or booking status **must not** overwrite historical financial facts [R71, R76]. Use **expand → migrate → contract**:
  1. **Expand** — add the new column/table; keep the old one.
  2. **Migrate** — backfill; dual-write if needed.
  3. **Contract** — only after readers have moved, drop the old field.

Expired / rejected / cancelled / refunded / no-show rows stay in the database [R55, R76].

## Failed mid-apply

1. Do **not** `migrate reset` on the shared project.
2. Read `prisma migrate status` and the Supabase logs.
3. If the SQL is not committed (`BEGIN` failed): fix the migration file if it has **not** been applied anywhere else; otherwise add a new forward migration.
4. If the SQL committed partially (rare with a single transaction): write a follow-up migration that completes or repairs the schema. Never rewrite an already-applied file on the shared project.
5. Record the incident in the PR.

## Class-change requests and their Realtime feed (2026-10-13)

`20261013022042_wire_e20_class_changes` (WIRE-2001, #374) was applied to
`xydundrayuusqizssgby` through the connector using the transaction-free Supabase
copy; the Prisma copy only adds `BEGIN`/`COMMIT`. Its checksum
`e01fa26e606130e59c4ff4643a6215a7ba77c109533dad51f49548bdcc0a0dfd` is recorded in
`_prisma_migrations`. Verified: table present with RLS on, policy
`class_change_requests_staff_read`, trigger `class_change_status_audit`.

`20261013170000_realtime_class_change_requests` then adds the table to the
`supabase_realtime` publication (checksum
`4adc3a4570f3cfd60da942fdaa0c1d22cf64ec06248a9bc0881b3ee3486c0229`, both
histories). The publication now lists `bookings`, `payments`,
`cancellation_requests`, `reschedule_requests`, and `class_change_requests`.

The 2026-10-13 sentence that listed `wire1701_payment_account_fields` as unapplied is out of date. Current hosted drift, the outage SQL, and the deploy guard are in [production-schema-drift.md](./production-schema-drift.md). `20261008114619_wire_e16_policy_forms` remains applied in Supabase history and missing from `_prisma_migrations`.

## Realtime admin queues (2026-10-13)

`20261013160000_realtime_admin_queues` adds `bookings`, `payments`,
`cancellation_requests`, and `reschedule_requests` to the `supabase_realtime`
publication so the admin inbox and queues update without a refresh
(`apps/admin/src/modules/realtime/AdminRealtimeSync.tsx`). Realtime applies each
table's existing RLS SELECT policies per subscriber, so no grants or policies
change. Idempotent; a no-op on plain Postgres. Applied to `xydundrayuusqizssgby`
through the connector on 2026-10-13 and recorded in both histories (Prisma
checksum `7cea12eb748a1e3599a91568076c198c179356e6f3cd568461ba5109ff2b97d8`).
Verified: the publication listed these four tables; `class_change_requests` was added by the follow-up below.

## Catalogue grant repair (2026-10-03)

`20261003031452_restore_class_catalogue_grants` is a forward-only, idempotent ACL
repair for #358. It restores published-class/marketing-roster reads for visitors
and signed-in users, restores RLS-governed roster writes for the class editor,
and limits direct coach reads to public fields. No row policies or data are
rewritten. Applied transactionally to the shared project and recorded in both
Prisma and Supabase histories through the connector. See
[class-catalogue.md](./class-catalogue.md#hosted-permissions-repair-2026-10-03-358)
for verification. Do not replay the historical baseline's blanket REVOKE without
reapplying later feature-specific grants.

## Booking reference repair (2026-10-03)

`20261003032321_fix_booking_reference_schema` fixes reservation failures with
`function gen_random_bytes(integer) does not exist`. Reservation functions fix
their search path to `public`, but hosted pgcrypto lives in `extensions`.
The migration resolves pgcrypto's installed schema and schema-qualifies the
private `opaque_reference()` helper, with an empty search path and unchanged
security-invoker privileges. References remain 16 random bytes / 32 hex characters.
No booking rules, grants, RLS policies, or existing records change.

Applied transactionally to the shared project and recorded in Prisma and
Supabase histories with the exact migration checksum. Verification uses
rollback-only reservation probes, including the reported session. The Supabase
security advisor no longer flags this helper's mutable search path; no new
findings were introduced. Other existing findings remain outside this repair.

## First migration (INF-003)

`20260919090000_inf003_create_app_meta` creates `app_meta` (schema version key) and is applied to `xydundrayuusqizssgby`.

## Customer registration marker (2026-10-03)

`20261003025442_customer_registration_marker` adds the nullable, indexed
`profiles.customerRegisteredAt` and the private Auth trigger that stamps customer
portal registrations without changing RLS or staff access. Existing customer
sign-up metadata supplies a one-time backfill; see [auth.md](./auth.md).
Applied transactionally to `xydundrayuusqizssgby`; Prisma and Supabase history
were reconciled through the connector with the exact SQL and SHA-256 checksum
after `prisma migrate resolve` failed on both direct and pooled connections.
The migration filename was created with the Supabase CLI, then moved into the
existing Prisma migration layout (no parallel local Supabase migration tree).
No destructive operations or new table grants. Verification used rollback-only
Auth/profile fixtures, including email/Google completion, staff exclusion, and
the absence of customer UPDATE/EXECUTE privileges on the new marker/function.
Runtime Prisma verification returned five customer registrations and excluded the
staff-only account. Security advisors showed no new findings; existing reports
for [definer views](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view),
[public definer RPCs](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable),
[mutable search paths](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable),
and [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
remain outside this registration change.

## Profile identity and public read (#344 / #345)

| Migration | Contents |
| --- | --- |
| `20261001090000_be344_create_avatars_bucket` | Private `avatars` bucket (5 MiB, jpeg/png/webp). Idempotent; replayed by `db:ensure-buckets`. Skips on plain Postgres. |
| `20261001090100_be344_extend_profile_identity` | Enums `fitness_goal`, `experience_level`, `heard_from_source`, `referral_channel`; `profiles` identity columns + checks + backfill; `profile_onboarding` / `profile_class_interests` (new schema file `onboarding.prisma`); `pending_uploads.profileId`; `handle_new_user` replacement; column-scoped customer grants; onboarding RLS; `avatars` storage policies; corrected `profiles_self_select` coach clause; `EXECUTE` on #298 helpers for `authenticated`. |
| `20261001090200_be345_create_public_read_functions` | Schema `app_public` with `public_session`, `public_event`, `public_session_roster`. |

Decisions:

- `ProfileOnboarding` / `ProfileClassInterest` live in `prisma/schema/onboarding.prisma` (not `identities.prisma`).
- `fullName` is kept as a **deprecated derived column** (expand phase). Trigger `profiles_sync_full_name` sets it to `trim(firstName || ' ' || lastName)` on every insert/update. Writers that still send only `fullName` (raw SQL, old code paths) get `firstName` / `lastName` split from it, so nothing breaks before the contract step. Prisma marks it `@default("")` so new writers can omit it. Drop it in a follow-up once the ~34 readers move.
- Name backfill splits on the first space: `firstName = split_part(trim(fullName), ' ', 1)`, `lastName = trim(rest)`. Single-word names keep `lastName = ''`; empty legacy names fall back to the email local part, then `Member`. **Caveat (epic #343 §8 Q1):** compound first names ("Maria Clara Santos" → `Maria` / `Clara Santos`) are split wrongly and need a manual fix in the profile / onboarding "You" step. The deprecated `fullName` is normalized to the derived form in the same backfill.
- `referralCode` uses a DB default (`@default(dbgenerated("app_private.generate_referral_code()"))`), so Prisma creates and the sign-up trigger never pass it. Existing rows are backfilled row by row (collision-safe). Format check `^[0-9A-HJKMNP-TV-Z]{8}$`.
- No `ProfileOnboarding` rows are created for existing users. A missing row means "not started".
- `profiles_self_select` from `20260922181100` compared `bookings."profileId"` with an unqualified `id` (resolved to `bookings.id`, uuid = text), which fails on a fresh database. `20261001090100` re-creates the policy with `app_private.coach_can_read_customer`. The broken historical file is unchanged (forward-only); a fresh `migrate deploy` on a brand-new database still stops at `20260922181100` until that file is reconciled — on `xydundrayuusqizssgby` this was worked around during the WIRE-0001/WIRE-0002 hosted catch-up by skipping that one `CREATE POLICY` during deploy and letting `20261001090100` supply the corrected version immediately after, in the same pass.

Validation was done on a disposable local Postgres 15 (`prepare-plain-postgres.sql` + all migrations, with the `20260922181100` line patched locally only), with and without pre-existing profiles. All three migrations (`20261001090000_be344_create_avatars_bucket`, `20261001090100_be344_extend_profile_identity`, `20261001090200_be345_create_public_read_functions`) have since been applied to `xydundrayuusqizssgby`; `_prisma_migrations` and the Supabase migration history are reconciled (WIRE-0001/WIRE-E00, 2026-10-02).

## WIRE-E03 hosted closeout check (2026-10-13)

Read-only inspection found that Supabase lists `wire_e16_policy_forms` as applied on 2026-10-09, while Prisma's `_prisma_migrations` does not list its local `20261008114619_wire_e16_policy_forms` counterpart. The two local SQL copies previously differed in idempotency guards and index names; the Prisma copy now matches the Supabase copy byte for byte. Hosted inspection confirmed the Supabase index names, RLS, both policies, and a form-aware acceptance function. Mark the Prisma counterpart applied before any `prisma migrate deploy`, or the policy-form DDL may be replayed. The local `20261005090000_wire1701_payment_account_fields`, `20261005100000_wire1801_report_row_ids`, and `20261013022042_wire_e20_class_changes` migrations are absent from both hosted ledgers; `class_change_requests` does not exist on hosted. The payment-account migration now drops and recreates its public projection because hosted has the old three-column view and PostgreSQL cannot reorder those columns with `CREATE OR REPLACE VIEW`; hosted dependency inspection found no dependent objects. The report migration now drops four functions before changing their `RETURNS TABLE` rows and restores server-only execute grants; hosted dependency inspection found no dependent database objects. Application public API reads work, but this is not the completed hosted schema required for the WIRE-E03 walkthrough. Review the SQL and deploy only after the migration histories are reconciled.

## Production drift (#382, 2026-10-25)

`20261020120000_session_change_rules` is not on `xydundrayuusqizssgby`. That is why `GET /api/public/sessions` returns 500. `20261005100000_wire1801_report_row_ids` is also unapplied and must not be run as written: its session report functions drop the #293 sales and coach-cost redaction. Three later migrations are already live in Supabase history and still absent from `_prisma_migrations`. Do not `prisma migrate deploy` until those rows are resolved. Apply steps, verification queries, and the read-only Deploy Production guard: [production-schema-drift.md](./production-schema-drift.md).
