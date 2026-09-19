# Agent Instructions — Balansé Wellness Hub

Read this file first. Product truth lives in `docs/MVP-ROADMAP.md` and `docs/screen-specs/`. This phase is **mocks only** for screens: no `fetch` to `/api/*`, no Supabase client calls from UI.

## Layout

- `apps/web` (9000): public + customer
- `apps/admin` (9001): admin
- `@balanse/domain`: enums, formatters, labels
- `@balanse/mock`: `MockDataAdapter` + in-memory fixtures + mock session
- `@balanse/ui`: shared primitives and wrappers
- `@balanse/config`: brand tokens and breakpoints
- `@balanse/db`: Prisma schema (`AppMeta` + BE-001–BE-024 business models, RLS, jobs)
- `@balanse/api`: BE-030–BE-043 HTTP handlers (mounted on `apps/web` `/api/*`; no FE wiring)

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

## Data

Screens obtain data only through `getMockAdapter()` (`MockDataAdapter`). Do not import fixture files from screen components. Coach rates exist only on admin coach types.

## Validation

`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`, `pnpm secrets:scan`.
