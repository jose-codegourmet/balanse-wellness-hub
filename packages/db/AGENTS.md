# Agent Instructions — `packages/db`

Local agent instructions for the shared database package. Read `/AGENTS.md` first, then this file.

---

## Scope

`packages/db` (`@balanse/db`) is the shared Prisma 6 client, schema, migrations, and seed data for the monorepo. It connects to Supabase Postgres. It is consumed by `apps/admin` and by the API routes in `apps/web`.

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
- `apps/web` — API routes (`src/app/api/{blog,pricing,testimonials}/route.ts`).

Both apps consume `@balanse/db` at runtime. No other workspace *package* (`packages/ui`, `packages/config`) depends on it.

---

## Important directories

| Directory | Purpose |
|---|---|
| `src/client.ts` | PrismaClient singleton |
| `src/index.ts` | Public exports |
| `prisma.config.ts` | Schema path and seed command for the Prisma CLI |
| `prisma/schema/` | Multi-file Prisma schema |
| `prisma/schema/migrations/` | Prisma migrations |
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
- `Profile.id` has a required FK to Supabase `auth.users` (`20260727060109_add_profiles_table`). Do not drop that FK to support plain Postgres. Do not rewrite that migration SQL (checksums on the live Supabase project). Local/CI databases must be Supabase (`supabase start` or hosted).
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
