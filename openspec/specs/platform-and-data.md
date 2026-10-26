# Spec: Platform and data access

## Requirements

1. The monorepo has `apps/web` for public/customer routes and `apps/admin` for staff routes. `@balanse/domain` owns shared vocabulary and formatting, `@balanse/config` owns brand tokens, `@balanse/ui` owns shared UI, `@balanse/db` owns Prisma, `@balanse/api` owns HTTP handlers, and `@balanse/api-client` owns typed request functions. `@balanse/mock` supplies Storybook fixtures and adapter behavior.
2. Runtime screens obtain `/api/*` data through typed `@balanse/api-client` calls and React Query, or use the server subpath's in-process dispatch in server components. UI components do not call Supabase directly, import fixture files, or duplicate route payload types. Storybook injects mock-backed data without requiring the live backend.
3. The HTTP route inventory is `packages/db/contracts/routes.ts`; OpenAPI is generated from it, and `@balanse/api` must provide a handler for each route. Validation errors use the shared field-error contract. Admin list pagination uses cursor contracts, with authorization and filtering applied before paging.
4. Supabase Auth supplies customer and staff sessions. The server resolves current actors and rechecks permissions for every protected operation. Customer ownership and staff permissions are enforced below the UI; staff roles and teaching capability are distinct. RLS and privileged functions protect the underlying Postgres data, including public projection functions that reveal only approved columns.
5. Prisma uses the multi-file schema under `packages/db/prisma/schema/` and forward migrations. The existing Supabase project `xydundrayuusqizssgby` is the backend of record. Server-only keys stay outside `NEXT_PUBLIC_*`; public/client code uses publishable credentials only.
6. Storage separates public marketing assets from private payment proofs and avatars. Signed upload intents bind actor, target, purpose, type and size; confirmation verifies the object. Private reads use short-lived signed URLs. An orphan cleanup job reaps unconfirmed intents; hold expiry and waitlist promotion jobs preserve booking invariants.
7. Brand/status/formatting helpers are shared rather than copied into screens. Money displays PHP and dates use `Asia/Manila`. Responsive page loading uses local skeletons and recoverable errors; raw internal enums are not customer-facing copy.
8. Component folders, colocated metadata/stories and form schema/default rules follow `docs/ways-of-working.md`. Jabkit source stays pristine, and app composition belongs in Balansé wrappers. The validation gates are lint, typecheck, build, Storybook build, brand guard and secret scan. These gates verify the checkout; they do not prove hosted migrations or owner content have been deployed.
9. Portal and admin realtime subscribers invalidate the relevant React Query scope when authorized rows change, and refresh server-rendered data when needed. Subscriptions are filtered by customer ownership or staff scope; a reconnect or returning tab catches up through the typed API rather than treating realtime payloads as a separate source of truth.
10. Production builds of either app must pass a read-only schema compatibility check against that Vercel project's production database before Next.js builds and before promotion to production. Missing Prisma model tables/columns or required report row IDs block both remote and prebuilt deploys. Remote builds use Vercel's sensitive credentials in place; local and preview builds generate Prisma but skip the live check. Migration application remains an explicit operation after SQL review and history reconciliation.

## Scenarios

- **Owned read:** Given customer A's booking id, when customer B requests it directly, the API and database deny the cross-customer read even if no UI link exposes it.
- **Role change:** Given an active staff actor whose role loses a permission, when they make a fresh admin request, the server denies the operation regardless of cached navigation state.
- **Storybook:** Given no backend session, when a screen story renders, injected mock fixtures supply its data without calling the live API or Supabase.
- **Missing production column:** Given deployed code requires `sessions.cancellable` but the target database lacks it, when Deploy Production runs for either app, the schema gate fails before Next.js builds or the deployment is promoted and directs the operator to reconcile the migrations.

## Sources

- `AGENTS.md`, `docs/ways-of-working.md`, `docs/backend/api-routes.md`, `docs/backend/api-contracts.md`, `docs/backend/rls-policies.md`, `docs/backend/uploads.md`, `docs/backend/jobs.md`.
