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

## First migration (INF-003)

`20260919090000_inf003_create_app_meta` creates `app_meta` (schema version key) and is applied to `xydundrayuusqizssgby`.

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
- `profiles_self_select` from `20260922181100` compared `bookings."profileId"` with an unqualified `id` (resolved to `bookings.id`, uuid = text), which fails on a fresh database. `20261001090100` re-creates the policy with `app_private.coach_can_read_customer`. The broken historical file is unchanged (forward-only); a fresh `migrate deploy` still stops at `20260922181100` until that file is reconciled.

Validation was done on a disposable local Postgres 15 (`prepare-plain-postgres.sql` + all migrations, with the `20260922181100` line patched locally only), with and without pre-existing profiles. Neither migration has been applied to `xydundrayuusqizssgby`; reconcile Prisma and Supabase histories first.
