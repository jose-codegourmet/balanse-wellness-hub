# Agent Instructions — `packages/db`

Local agent instructions for the shared database package. Read `/AGENTS.md` first, then this file.

## Read order

Follow the root `AGENTS.md` order and stop once the picture is clear:

1. **OpenSpec** — the matching spec under `openspec/specs/` and any in-flight `openspec/changes/` proposal. Backend behavior in `docs/backend/` comes after OpenSpec, not before.
2. **Meta** — when the work touches a UI component, read that component’s `Component.meta.ts` next. If it already explains the component, do not skim the implementation.
3. **Implementation** — schema, migrations, or `Component.tsx` only when the spec/meta is missing, stale, or does not answer the question.

---

## Scope

`packages/db` (`@balanse/db`) is the shared Prisma 6 client, schema, migrations, SQL rules/jobs, and seed data. It connects to Supabase Postgres. HTTP route handlers are out of scope until BE-030+.

- **Workspace name**: `@balanse/db`
- **Filter**: `pnpm --filter @balanse/db`
- **Package name**: `@balanse/db`

---

## Public entry points

| Entry | Path | What it provides |
|---|---|---|
| `.` | `src/index.ts` | `prisma` singleton + re-export of all `@prisma/client` types |
| `./client` | `src/client.ts` | `prisma` singleton only |

---

## Consumers

- `apps/admin` — Server Components, Server Actions, and auth profile upserts.
- `apps/web` — API routes via `@balanse/api` (`src/app/api/[[...path]]/route.ts`).

Both apps consume `@balanse/db` at runtime. No other workspace *package* (`packages/ui`, `packages/config`) depends on it.

---

## Important directories

| Directory | Purpose |
|---|---|
| `src/client.ts` | PrismaClient singleton |
| `src/index.ts` | Public exports |
| `prisma.config.ts` | Schema path and seed command for the Prisma CLI |
| `prisma/schema/` | Multi-file Prisma schema (`roles.prisma` = #298) |
| `prisma/migrations/` | Prisma migrations |
| `prisma/seed.ts` | Seed script |
| `prisma/constants/` | Seed data constants |

---

## Validation commands

| Concern | Command |
|---|---|
| Type check | `pnpm --filter @balanse/db typecheck` |
| Generate client | `pnpm --filter @balanse/db db:generate` |
| Migrate | `pnpm --filter @balanse/db db:migrate` |
| Seed | `pnpm --filter @balanse/db db:seed` |
| Studio | `pnpm --filter @balanse/db db:studio` |
| Biome (repo-wide) | `pnpm lint` |

---

## Restrictions and boundaries

- Server-only. Never import `@balanse/db` from a `"use client"` component in either app.
- Preserve the public API (`prisma` and re-exported Prisma types). Do not remove `export * from "@prisma/client"` without a plan.
- Do not add app-specific logic to this package. Keep it a generic database client and schema.
- Migrations must be applied in the correct order. Do not edit existing migration files after they have been applied to a shared environment.
- `profiles.id` has a required FK to `auth.users`. CI creates a stub `auth.users` via `scripts/prepare-plain-postgres.sql` before migrate. Do not drop the FK on the hosted project.
- Use the pooled URL for `DATABASE_URL` in production/serverless; use the direct URL for `DIRECT_URL` always.

---

## Common task routing

| Task | Read next |
|---|---|
| Add or change a model | `packages/db/docs/development.md`, `packages/db/docs/README.md` |
| Use Prisma in an app | `docs/api-and-data-fetching.md`, `packages/db/docs/examples.md` |
| Add seed data | `prisma/seed.ts`, `prisma/constants/`, `packages/db/docs/examples.md` |
| Migration issue | `packages/db/docs/development.md` |

---

## Documentation maintenance

Update this file and `packages/db/docs/` when:
- A public export changes.
- The schema or model list changes.
- A new consumer appears.
- Migration or seed commands change.
- The pooled vs direct URL guidance changes.

## Session coach model

Classes have an optional marketing roster through `ClassMarketingCoach`; this does not assign session staff. `GymSession.coaches` contains one or more `SessionCoach` assignments, each with immutable rate snapshots. Deferred migration constraints enforce the minimum of one coach; new assignments require an active coach. See `docs/backend/session-coach-assignments.md` at the repository root for migration/backfill and public projection rules.

## Staff roles (#298)

`StaffMember.roleId` → `staff_role_definitions`. Canonical keys come from
`@balanse/domain`. SQL helpers and last-Super-Admin locking are documented in
`docs/backend/staff-roles.md` and `docs/backend/rls-policies.md`.
`is_admin()` is Super Admin only — never broaden it to all staff.
The leftover `StaffRole` enum is not dropped in this wave.

## Class marketing catalogue

`GymClass` includes slug, custom page redirect, rich-text content, cover and gallery fields. `ClassMarketingCoach` stores the public teaching roster. The additive `20260921130000_class_marketing_catalogue` SQL was applied to the shared project through Supabase; reconcile migration history before any full Prisma deployment. See `docs/backend/class-catalogue.md`.

## Session events (#319)

`session_events` is a 1:0..1 wrapper on `GymSession` (`ON DELETE RESTRICT`). Price, capacity, and session status stay on the session. `EventStatus` is separate from `SessionStatus`. RLS is staff-only (`events.read` / `events.manage`); there is no anon read. Status changes write one `audit_events` row. The migration is staged and must not be applied to the shared project until histories are reconciled. See `docs/backend/session-events.md`.

## Session bundles (BE-058)

`bundles`, `bundle_class_applicability`, `bundle_acquisitions`, `bundle_acquisition_payments`, `customer_bundles`, and `bundle_redemptions` implement session packages. Remaining credits are derived from the redemption ledger. The Prisma migration is staged and must not be applied to the shared project until histories are reconciled. See `docs/backend/session-bundles.md`.
