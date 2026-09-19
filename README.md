# Balansé Wellness Hub

Calendar-first class booking for **Balansé** (Cebu). This repository is a pnpm + Turborepo monorepo based on `fe-multi-web-template`, with demo brand content removed.

This phase ships **mocked screens** plus INF wiring to the existing Supabase project `xydundrayuusqizssgby` (ap-southeast-1). Apps do not call live APIs yet. See `docs/backend/`.

## Apps

| App | Port | Purpose |
| --- | --- | --- |
| `apps/web` | 9000 | Public site + customer portal |
| `apps/admin` | 9001 | Admin portal (no public sign-up) |

Shared packages: `@balanse/ui`, `@balanse/domain`, `@balanse/mock`, `@balanse/config`, `@balanse/db`.

## Quick start

```bash
nvm use
pnpm install
cp .env.example .env
cp packages/db/.env.example packages/db/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
# Fill DATABASE_URL / DIRECT_URL / publishable key locally — never commit them
pnpm --filter @balanse/db db:generate
pnpm dev
```

- Web: http://localhost:9000
- Admin: http://localhost:9001
- Storybook (web): `pnpm --filter web storybook` → http://localhost:6006

Set `NEXT_PUBLIC_ENABLE_MOCK_HARNESS=true` in app env files to show the mock role switcher.

## Quality

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
pnpm guard:brand
pnpm secrets:scan
```

Conventional Commits are enforced via Husky + commitlint.

## Docs

- Product roadmap: `docs/MVP-ROADMAP.md`
- Screen specs: `docs/screen-specs/`
- Infra: `docs/backend/`
- FE screen checklist: `docs/engineering/fe-screen-ticket-checklist.md`
- Jabkit convention: `docs/engineering/jabkit.md`
- Mock harness removal (WIRE-002): `docs/engineering/mock-harness-removal.md`
