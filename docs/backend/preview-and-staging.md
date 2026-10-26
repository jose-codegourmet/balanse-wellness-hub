# Preview and staging

**INF-008.** Reviewers use protected previews backed by the configured API. Storybook provides fixture-backed screen previews. Production DNS is out of scope.

## Layout

Two Vercel projects on team `josecodegourmets-projects`, same GitHub repo `jose-codegourmet/balanse-wellness-hub`:

| Project name | Vercel id | Root directory | Local port | Indexing |
| --- | --- | --- | --- | --- |
| `balanse-web` | `prj_hxMvGbjeVZODSnVB623ul8S7sl28` | `apps/web` | 9000 | Preview: `noindex` (safe default) |
| `balanse-admin` | `prj_TJEAFVM72E3rT3KIL7kMK69EkOdZ` | `apps/admin` | 9001 | Always `noindex` + Deployment Protection |

Git linking from the API returned 404 after create — connect the GitHub repo in each project's **Settings → Git** if previews do not appear on PRs.

Each PR should produce two preview URLs (Vercel Git integration).

## Preview env

Set the public site origins and Supabase publishable settings on **Preview** for both projects:

```
NEXT_PUBLIC_SITE_URL=$VERCEL_URL
```

Server-side API handlers need protected database and storage credentials. Configure them in the deployment secret store; never put service-role keys in `NEXT_PUBLIC_*` variables. Protect admin previews before allowing real staff sign-in.

## Human runbook (Vercel + GitHub)

1. In Vercel (team `josecodegourmets-projects`), import the GitHub repo twice with the root directories above, or accept the projects created by INF.
2. Framework: Next.js. Install: `pnpm install` from the repository root (`cd ../.. && pnpm install` when the root directory is `apps/web` or `apps/admin`). Build: `cd ../.. && pnpm --filter web build` / `pnpm --filter admin build`.
3. **Admin** project → Settings → Deployment Protection → enable **Vercel Authentication** or a shared password. Share access only with Rex and implementers.
4. Optional **Staging**: a `staging` branch aliased on both projects with its own protected API configuration.
5. Confirm the GitHub check “Vercel Preview” comments include both URLs.

## Production deployment gate

`.github/workflows/deploy-production.yml` requires the schema gate in the selected
ref. Both app build commands run `pnpm --filter @balanse/db db:check-schema --production-only`
before Next.js, regenerating Prisma for every build and checking the database
when `VERCEL_ENV=production`. Remote mode checks inside Vercel, where the sensitive
`DATABASE_URL` is available; `vercel pull` only returns `[SENSITIVE]` placeholders.
No extra GitHub database secret is required. Prebuilt mode fails closed if its
runner only has a redacted credential; use remote mode for this configuration.
Local and preview builds skip the live check. For a manual read-only probe, use
`pnpm --filter @balanse/db db:check-schema --deployment-env <absolute-env-file>`.
The check only resolves model columns and report ID projections with zero-row reads.
On failure, review/apply the pending
SQL and reconcile hosted history using `docs/backend/migrations.md`, then rerun.
Do not bypass the gate or run a blanket migration replay to unblock a deploy.
Use a full 40-character commit SHA when supplying a SHA in the workflow's `ref`
input; `actions/checkout` treats abbreviated SHAs as branch/tag patterns.

## Admin not publicly indexable

- `apps/admin/src/app/robots.ts` disallows all crawlers.
- `X-Robots-Tag: noindex, nofollow, noarchive` via middleware and `vercel.json`.
- Deployment Protection is the access control AC; robots headers are defense in depth, not a lock.
