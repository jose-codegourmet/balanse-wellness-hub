# Production schema drift (#382)

Read-only check on 2026-10-25 against hosted project `xydundrayuusqizssgby` (Postgres 17.6). No SQL in this change was applied to that database.

Deploy Production does not migrate. The public schedule 500 is the deployed web code reading `sessions.cancellable` and `sessions.reschedulable` while those columns are absent. Apply the outage SQL below by hand, then record history. Do not run `prisma migrate deploy` against this project until the ledger gaps in this document are resolved: deploy would replay migrations that are already live, including `staff_members_coach_role_linked`, whose `CREATE TRIGGER` is not idempotent.

## Ledger comparison

Repo folders live in `packages/db/prisma/migrations`. Supabase history is `supabase_migrations.schema_migrations` (`name` has no timestamp prefix; versions are Supabase timestamps). Prisma history is `public._prisma_migrations` (`migration_name` is the folder name). A repo migration is already on the database when either ledger contains it.

38 repo folders. 38 Supabase rows. 33 finished Prisma rows.

Two Supabase names are historical and have no repo folder: `be017_018_capacity_jobs_core`, `be017_018_audit_and_transitions`. The combined repo migration `20260919120100_be017_018_capacity_jobs_and_rules` is in both ledgers. Those two names are not unapplied work.

### Unapplied (schema absent)

| Repo folder | Supabase name | On the database? |
| --- | --- | --- |
| `20261005100000_wire1801_report_row_ids` | `wire1801_report_row_ids` | No. Report functions still return the #293 shapes, without `classId` / `coachId` / `sessionId`. |
| `20261020120000_session_change_rules` | `session_change_rules` | No. `public.sessions` has `venueId`, `name`, `bookable` and does not have `cancellable` or `reschedulable`. |

### Applied in Supabase history only (do not re-run)

These are on the database. They are missing from `_prisma_migrations`, so `prisma migrate status` reports them as pending. That is a false pending. The deploy guard treats the Supabase name as applied and prints a warning.

| Repo folder | Evidence they already ran |
| --- | --- |
| `20261008114619_wire_e16_policy_forms` | `customer_policy_form` exists. `policy_form_requirements` exists. `booking_policy_acceptances.form` and `acquisitionId` exist. `bookingId` is nullable. |
| `20261013180000_realtime_bundle_acquisitions` | `supabase_realtime` includes `bundle_acquisitions` and `bundle_acquisition_payments`. |
| `20261013190000_staff_coach_role_check_on_commit` | Constraint trigger `staff_members_coach_role_linked` exists, deferrable, initially deferred, enabled. |

Every other repo folder is in `_prisma_migrations` with a finished row whose checksum matches the file SHA-256, and the Supabase `name` matches the folder slug.

## Verdicts

### `20261020120000_session_change_rules` — apply this to restore the schedule

Adds `sessions.cancellable` and `sessions.reschedulable`, both `BOOLEAN NOT NULL DEFAULT true`, plus column comments. No other tables, policies, or functions.

- **Additive.** Existing rows keep today's customer behaviour: both flags true. No backfill query. No data is rewritten or deleted.
- **Lock.** Postgres 17 takes a brief `ACCESS EXCLUSIVE` lock for `ADD COLUMN`. A non-volatile constant default is stored in the catalog (Postgres 11+). The sessions table is not rewritten.
- **Dependencies.** Requires only `public.sessions`, which exists. No dependency on `wire1801_report_row_ids` or on any other unapplied folder.
- **Not obsolete.** `packages/api/src/handlers/public.ts` selects both columns. That is the production 500.
- **Not already applied** under another name. Last Supabase migration is `20261013093913` / `staff_coach_role_check_on_commit`.

### `20261005100000_wire1801_report_row_ids` — do not apply this file as written

`DROP FUNCTION` plus `CREATE` for `report_class_performance_v2`, `report_coach_costs`, `report_session_performance`, and `report_session_drilldown`, so each `RETURNS TABLE` includes the id (and the drill-down title columns). Grants stay server-only: `REVOKE` from `PUBLIC`, `anon`, and `authenticated`; `GRANT EXECUTE` to `service_role`.

- **Not a table rewrite.** It locks the function objects while they are replaced. It does not rewrite `sessions` or other tables. `DROP FUNCTION` uses the default `RESTRICT`. Hosted inspection for the original change found no dependent database objects; re-check `pg_depend` before a later apply in case something was added since.
- **Existing rows.** Unchanged. The functions are `STABLE`.
- **Dependencies.** Needs objects from already-applied migrations: `sessions`, `classes`, `bookings`, `session_coaches`, `coaches`, `waitlist_entries`, `refunds`, `session_status`, and the `app_private` report helpers. It does not read `cancellable` or `reschedulable`. It can run before or after the session-change migration. Folder order, if both are ever applied, is this file first (`20261005100000`), then `20261020120000_session_change_rules`.
- **Not obsolete, and not already applied.** Live `report_class_performance_v2` still returns `className, sessions, revenue, occupancy, noShows` only. The admin report queries on `main` expect `classId`, `coachId`, and `sessionId`.
- **Do not run the current SQL.** `report_class_performance_v2` in the file still zeroes revenue unless `reports.sales.read` is held (or `auth.uid()` is null). `report_session_performance` and `report_session_drilldown` in the file always return raw price, revenue, refunds, and coach cost. The live functions from `20260922181200_be289_293_report_sensitive_fields` zero those columns unless the matching report permission is held. Replacing them would drop that defence. The API calls these functions with the database role (`auth.uid()` null), and `EXECUTE` is revoked from `anon` / `authenticated`, so this is not the schedule outage and it is not an open customer path. It still should not ship until the two function bodies keep the #293 `CASE` expressions and add the id columns.
- **`BEGIN` / `COMMIT`.** The Prisma file wraps itself in a transaction. `apply_migration` runs the `query` string as given. A tool that is already inside a transaction will treat an inner `COMMIT` as the end of the outer transaction. This file is not in the outage plan. If a later revised file still has `BEGIN` / `COMMIT`, run it from a session that is not already in a transaction, or remove those two lines and let the runner own the transaction.

## Ordered SQL for the outage

Run this and only this against `xydundrayuusqizssgby`. It is the full body of `packages/db/prisma/migrations/20261020120000_session_change_rules/migration.sql` (SHA-256 `17257288c92d4079a48edcf6cabb5611548d381d6fe5e136889e2377d58b4157`).

Supabase `apply_migration` name: `session_change_rules`. The deploy guard matches that slug. There is no `BEGIN` / `COMMIT` in this statement.

```sql
-- #380 per-session change rules. Existing sessions keep today's behaviour: both on.
-- The switches only gate customer cancellation / reschedule requests; staff
-- actions, studio cancellations, and manual refunds are unchanged.
ALTER TABLE "public"."sessions"
  ADD COLUMN "cancellable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "reschedulable" BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN "public"."sessions"."cancellable" IS
  'Customers may open a cancellation request for a booking on this session. Off for one-off events. Staff actions are unaffected.';
COMMENT ON COLUMN "public"."sessions"."reschedulable" IS
  'Customers may open a reschedule request from a booking on this session. Off for one-off events. Does not block being chosen as a reschedule target.';
```

After the statement succeeds, record Prisma history so a later `migrate deploy` does not try to add the columns again. This writes a ledger row. It does not run SQL. Run it only after the `ALTER` is verified:

```bash
pnpm --filter @balanse/db exec prisma migrate resolve --applied 20261020120000_session_change_rules
```

`resolve` needs `DIRECT_URL`. Do this from an operator machine, not from Deploy Production.

Separately, and only as history repair, mark the three already-live migrations applied in Prisma. Do not re-execute their files:

```bash
pnpm --filter @balanse/db exec prisma migrate resolve --applied 20261008114619_wire_e16_policy_forms
pnpm --filter @balanse/db exec prisma migrate resolve --applied 20261013180000_realtime_bundle_acquisitions
pnpm --filter @balanse/db exec prisma migrate resolve --applied 20261013190000_staff_coach_role_check_on_commit
```

Leave `20261005100000_wire1801_report_row_ids` unrecorded until a revised migration keeps the #293 redaction.

## Verification after the ALTER

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sessions'
  AND column_name IN ('cancellable', 'reschedulable')
ORDER BY column_name;
```

Expect two rows: `boolean`, `NO`, default `true`.

```sql
SELECT version, name
FROM supabase_migrations.schema_migrations
WHERE name = 'session_change_rules';
```

Expect one row when `apply_migration` was used with that name.

```sql
SELECT migration_name, checksum, finished_at IS NOT NULL AS finished, rolled_back_at IS NULL AS not_rolled_back
FROM public._prisma_migrations
WHERE migration_name = '20261020120000_session_change_rules';
```

Expect `finished` and `not_rolled_back`, checksum `17257288c92d4079a48edcf6cabb5611548d381d6fe5e136889e2377d58b4157`, after `migrate resolve`.

Smoke, after the columns exist. No redeploy is required for the web app that is already on this code:

- `GET https://balanse.joseadrianbuctuanon.dev/api/public/sessions?from=2026-01-01T00:00:00.000Z&to=2027-01-01T00:00:00.000Z` returns 200.
- `GET https://balanse.joseadrianbuctuanon.dev/book/calendar` renders the schedule without the load-error banner.
- Open one public session detail URL and one public event detail URL from that payload.
- Signed-in portal schedule: `https://balanse.joseadrianbuctuanon.dev/portal/schedule`.
- One booking path that loads the session.

Hold the admin production deploy until this `ALTER` is in place. Admin schedule code on `main` reads the same columns.

If `wire1801` is applied later, this is the shape check (not a reason to apply the current file):

```sql
SELECT p.proname, pg_get_function_result(p.oid) AS result
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'report_class_performance_v2',
    'report_coach_costs',
    'report_session_performance',
    'report_session_drilldown'
  )
ORDER BY 1;
```

`classId`, `coachId`, and `sessionId` should appear, and the session functions should still zero sales and coach-cost columns for a caller who lacks those permissions.

## Deploy guard

`Deploy Production` runs `packages/db/scripts/check-production-migration-drift.ts` before `vercel deploy`. The job checks out the ref being deployed.

A repo folder counts as present when:

- `_prisma_migrations` has that folder name, `finished_at` is set, `rolled_back_at` is null, and `checksum` equals the SHA-256 of `migration.sql`, or
- `supabase_migrations.schema_migrations.name` equals the slug after the timestamp prefix (or `version || '_' || name` equals the folder).

The job fails closed when `DIRECT_URL` is missing, the connection or either history query errors, the migrations directory is empty, a folder is in neither ledger, a Prisma row is unfinished or rolled back, or a finished checksum does not match the file. Connection errors are redacted and the URL is not printed. Supabase-only matches are warnings, not failures, because those three migrations are already live.

`prisma migrate status` alone is the wrong gate: it would fail every deploy on those three history gaps. `prisma migrate diff` from the live database to the Prisma schema is the wrong gate too: the schema does not model RLS, grants, or SQL functions, so the diff would not be empty on a healthy database.

The workflow does not call `migrate deploy`, `migrate resolve`, or `apply_migration`.

### Secret

Repository Actions secret **`DIRECT_URL`**. Direct Postgres URL, port 5432, same meaning as `packages/db/.env`. `workflow_call` callers must pass it (or `secrets: inherit`). Do not put it in `NEXT_PUBLIC_*`. The guard does not use `DATABASE_URL`.

Local check against a database you are allowed to read:

```bash
pnpm --filter @balanse/db db:check-production-drift
```

Evaluator fixture, no database:

```bash
pnpm --filter @balanse/db exec tsx scripts/check-production-migration-drift.ts --self-check
```
