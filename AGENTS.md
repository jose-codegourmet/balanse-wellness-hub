# Agent Instructions — Balansé Wellness Hub

Read this file first. Product truth lives in OpenSpec (`openspec/specs/`, in-flight work in `openspec/changes/`), then `docs/MVP-ROADMAP.md` and `docs/screen-specs/`. This phase is **mocks only** for screens except the explicitly authorized database-backed class catalogue (2026-09-21). Class routes use server-side Supabase calls and verified admin server actions; other screens remain on MockDataAdapter. No direct Supabase client calls from UI. See `docs/backend/class-catalogue.md`.

## Read order

When working on a screen or component, read in this order and **stop as soon as you have a clear picture**:

1. **OpenSpec** — `openspec/specs/` for the capability (`fe-public-screens`, `fe-customer-screens`, `fe-admin-screens`, `fe-shared-systems`, `fe-foundation`). Check `openspec/changes/` if a matching change is in flight. Do not start from implementation.
2. **`Component.meta.ts`** — colocated in the component’s kebab-case folder. Purpose, API, variants, and when to use / not use. If the meta already explains the component, **do not skim the implementation**.
3. **Implementation** (`Component.tsx` and other companions) — only when the meta is missing, stale, or does not answer the question (bug, behavior change, type gap).

Phase closeout notes in `docs/metas/` are historical delivery records, not a substitute for OpenSpec. Nested `AGENTS.md` files inherit this order.

## Layout

- `apps/web` (9000): public + customer
- `apps/admin` (9001): admin
- `@balanse/domain`: enums, formatters, labels
- `@balanse/mock`: `MockDataAdapter` + in-memory fixtures + mock session
- `@balanse/ui`: shared primitives and wrappers
- `@balanse/config`: brand tokens and breakpoints
- `@balanse/db`: Prisma schema (`AppMeta` + BE-001–BE-024 business models, RLS, jobs; BE-055/056 amendments)
- `@balanse/api`: BE-030–BE-043 + BE-050–056 HTTP handlers (mounted on `apps/web` `/api/*`; no FE wiring)

## Project Structure & Documentation

Before making structural changes (new folders, moving files, introducing new conventions), check whether `docs/ways-of-working.md` exists, read it if present, and follow its conventions. Update that file in the same change whenever a new pattern is introduced or an existing one is deviated from.

### Component colocation convention

- Route-specific components live in a `_components/` folder (and `_hooks/`, `_lib/` as needed) colocated next to the route that uses them, e.g. `apps/web/src/app/(portal)/portal/bookings/_components/booking-card/BookingCard.tsx`. Wrap each component in its own `kebab-case` folder — never dump sibling `SomeExample.tsx` / `SomeExample.meta.ts` files as loose files in a shared directory. The underscore prefix excludes `_components/` from Next.js routing.
- Shared/global components used by 2+ unrelated routes live in `src/components/` (with `jabkit/` for vendored primitives and `balanse/` for app composition), never inside `app/`.
- Decision rule: start colocated; promote to `src/components/` only once a second, unrelated route needs the component.
- Use route groups `(groupName)/` to organize related routes without affecting the URL. This repo already uses `(public)`, `(auth)`, `(portal)` in `apps/web` and `(dashboard)` in `apps/admin`.
- Never place a plain (non-route) `.tsx` file directly inside a route segment folder in `app/`.

## Infrastructure

- Do **not** create a new Supabase project. Use `xydundrayuusqizssgby`.
- Prisma lives in `packages/db/prisma/schema/*.prisma` (multi-file). Conventions: both relation sides, `@id @default(...)`, `createdAt`/`updatedAt`, `@@index`, `@unique`.
- Never commit secrets. Service-role keys must not appear in `NEXT_PUBLIC_*`.
- Previews run mock mode. Full backend docs: `docs/backend/`.

## UI components (JabKit)

Jabkit is source-distributed. Each app has `jabkit.config.json`.

- Install with `npx @jabkit/cli add <name>` from the app directory.
- Registry URL comes from `JABKIT_REGISTRY` when set, otherwise `jabkit.config.json`.
- Vendored files live in `src/components/jabkit/` and stay pristine.
- App-specific composition lives in `src/components/balanse/`.
- Do not hand-edit installed Jabkit source unless a ticket explicitly requires a patch, and then record it.

## Component process

Wrap each component in its own `kebab-case` folder. Always colocate `Component.meta.ts` (AI-facing contract — read this before `Component.tsx`), `Component.tsx`, and `Component.stories.tsx`. Add `Component.schema.ts` and `Component.defaults.ts` **only when the component is a form** (zod value schema + `react-hook-form` `defaultValues`). Do not add schema/defaults to non-form components. **Do not write `Component.usecase.md`** — purpose lives in `Component.meta.ts`. Admin composition may nest under a feature parent (`dashboard/dashboard-bento/`). Do not dump sibling components as loose files in a shared folder. Forms use `react-hook-form` + `zodResolver`, with schema and `defaultValues` colocated, exported, and reused by the story. Full rules: `docs/ways-of-working.md`.

## Data

Screens obtain data through `getMockAdapter()` (`MockDataAdapter`), except class catalogue routes in configured database mode. Do not import fixture files from screen components. Coach rates exist only on admin coach types.

## Tests

Do **not** write new unit tests, test files, or test suites. Do not add, expand, or “complete” `*.test.*` / `*.spec.*` files unless the user explicitly asks. Prefer typecheck and lint for confidence.

## Validation

`pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`, `pnpm secrets:scan`. Skip `pnpm test` unless the user asks.
