# Migration workflow

**INF-003.** Prisma under `packages/db` is the schema source of truth. Supabase hosts Postgres.

## Layout

```
packages/db/prisma/schema/
  schema.prisma          # generator + datasource
  app-meta.prisma        # INF baseline (`app_meta`)
  enums.prisma           # BE-001
  config.prisma          # BE-019
  identities.prisma      # BE-002 / BE-003 / BE-055 (StaffMember.coach) + #298 roleId
  roles.prisma           # #298 staff_role_definitions / permission_definitions
  catalogue.prisma       # BE-004 / BE-005 / BE-006 / BE-055 (Coach.staffMemberId)
  policies.prisma        # BE-007
  reservations.prisma    # BE-008…BE-015 / BE-056 (PaymentQrCode)
  audit.prisma           # BE-016
  bundles.prisma         # BE-058 session packages
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
