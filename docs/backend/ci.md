# CI pipeline

**INF-007.** Workflow: `.github/workflows/ci.yml`.

## Jobs (every PR and every push to `main`)

1. **secrets-scan** — `pnpm secrets:scan`
2. **commitlint** — Conventional Commits on the PR title / commit range
3. **verify** — `pnpm install --frozen-lockfile`, `pnpm db:generate`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm build-storybook`
4. **be-integration** — stubs `auth`/`storage`, `prisma migrate deploy`, then `pnpm --filter @balanse/db test:integration` and `pnpm --filter @balanse/api test:integration` on disposable Postgres 17.

A type error or lint error fails **verify**. Both `web` and `admin` build from a clean cache (Actions cache on the pnpm store + Turbo).

## Duration and caching

| Layer | What | Typical effect |
| --- | --- | --- |
| `actions/setup-node` + `cache: pnpm` | pnpm store | Fast `pnpm install` on cache hit |
| `actions/cache` on `.turbo` | Turborepo remote-local cache | Skips unchanged `build` / `typecheck` outputs |
| GitHub-hosted `ubuntu-latest` | Full verify | Dominated by Next.js compile + Storybook; expect a few minutes on a cold cache, less on a warm one |

Do not add the service-role key to CI for the default verify job.

## Production deploy (dispatch only)

**Workflow:** `.github/workflows/deploy-production.yml`.

Does **not** run on push. Vercel Git deploys may no-op while ignore-build is `exit 0`; this Action uses the Vercel CLI so that setting does not apply.

1. Add repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_WEB`, `VERCEL_PROJECT_ID_ADMIN` (see comments in the workflow file and project ids in `docs/backend/preview-and-staging.md`).
2. Actions → **Deploy Production** → Run workflow.
3. Choose `web`, `admin`, or `both` (default). Leave `ref` empty to deploy `main`. Use `prebuilt` (default) or `remote`.

CLI commands run from the **repository root** so workspace packages are included; each Vercel project’s Root Directory (`apps/web` / `apps/admin`) comes from project settings. `prebuilt` is `vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`. `remote` is `vercel deploy --prod` (Vercel builds the upload).

Reusable callers must pass the four secrets or use `secrets: inherit`. Deploy jobs use the GitHub `production` environment (add required reviewers there if you want an approval gate).

## Local equivalent

```bash
pnpm secrets:scan
pnpm db:generate
pnpm typecheck
pnpm lint
pnpm build
pnpm build-storybook
```
