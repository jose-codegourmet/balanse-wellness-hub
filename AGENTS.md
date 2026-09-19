# Agent Instructions — Balansé Wellness Hub

Read this file first. Product truth lives in `docs/MVP-ROADMAP.md` and `docs/screen-specs/`. This phase is **mocks only**: no `fetch` to `/api/*`, no Supabase client calls from screens.

## Layout

- `apps/web` (9000): public + customer
- `apps/admin` (9001): admin
- `@balanse/domain`: enums, formatters, labels
- `@balanse/mock`: `MockDataAdapter` + in-memory fixtures + mock session
- `@balanse/ui`: shared primitives and wrappers
- `@balanse/config`: brand tokens and breakpoints
- `@balanse/db`: placeholder Prisma schema (no business models yet)

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

`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`.
