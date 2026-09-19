# CI pipeline

**INF-007.** Workflow: `.github/workflows/ci.yml`.

## Jobs (every PR and every push to `main`)

1. **secrets-scan** — `pnpm secrets:scan`
2. **commitlint** — Conventional Commits on the PR title / commit range
3. **verify** — `pnpm install --frozen-lockfile`, `pnpm db:generate`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm build-storybook`
4. **be-integration** — reserved. Runs `pnpm --filter @balanse/db test:integration` against a disposable Postgres **only when** that script exists (after `BE-001`). Until then the job reports skipped.

A type error or lint error fails **verify**. Both `web` and `admin` build from a clean cache (Actions cache on the pnpm store + Turbo).

## Duration and caching

| Layer | What | Typical effect |
| --- | --- | --- |
| `actions/setup-node` + `cache: pnpm` | pnpm store | Fast `pnpm install` on cache hit |
| `actions/cache` on `.turbo` | Turborepo remote-local cache | Skips unchanged `build` / `typecheck` outputs |
| GitHub-hosted `ubuntu-latest` | Full verify | Dominated by Next.js compile + Storybook; expect a few minutes on a cold cache, less on a warm one |

Do not add the service-role key to CI for the default verify job.

## Local equivalent

```bash
pnpm secrets:scan
pnpm db:generate
pnpm typecheck
pnpm lint
pnpm build
pnpm build-storybook
```
