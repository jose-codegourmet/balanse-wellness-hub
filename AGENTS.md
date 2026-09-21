# Agent Instructions — Balansé Wellness Hub

Read this file first. Product truth lives in `docs/MVP-ROADMAP.md` and `docs/screen-specs/`. This phase is **mocks only** for screens: no `fetch` to `/api/*`, no Supabase client calls from UI.

## Layout

- `apps/web` (9000): public + customer
- `apps/admin` (9001): admin
- `@balanse/domain`: enums, formatters, labels
- `@balanse/mock`: `MockDataAdapter` + in-memory fixtures + mock session
- `@balanse/ui`: shared primitives and wrappers
- `@balanse/config`: brand tokens and breakpoints
- `@balanse/db`: Prisma schema (`AppMeta` + BE-001–BE-024 business models, RLS, jobs; BE-055/056 amendments)
- `@balanse/api`: BE-030–BE-043 + BE-050–056 HTTP handlers (mounted on `apps/web` `/api/*`; no FE wiring)

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

Every component added or materially changed ships five colocated files: `Component.tsx`, `Component.schema.ts` (exported props type; plus a `zod` value schema when it is a form or form control), `Component.defaults.ts` (`<component>DefaultValues`), `Component.stories.tsx` (Storybook `meta` with `args` seeded from the defaults), and `Component.usecase.md`. Forms use `react-hook-form` + `zodResolver`, with schema and `defaultValues` colocated, exported, and reused by the story. Reference implementations: `packages/ui/src/components/skeleton/` and `packages/ui/src/components/scroll-area/`. Full rules and the scaffold: `docs/component-guide.md`, `docs/templates/component/`.

## Data

Screens obtain data only through `getMockAdapter()` (`MockDataAdapter`). Do not import fixture files from screen components. Coach rates exist only on admin coach types.

## Tests

Do **not** write new unit tests, test files, or test suites. Do not add, expand, or “complete” `*.test.*` / `*.spec.*` files unless the user explicitly asks. Prefer typecheck and lint for confidence.

## Validation

`pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`, `pnpm secrets:scan`. Skip `pnpm test` unless the user asks.
