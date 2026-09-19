# Preview and staging

**INF-008.** Coach Rex reviews mocked screens without a local setup. Production DNS is out of scope.

## Layout

Two Vercel projects, same GitHub repo `jose-codegourmet/balanse-wellness-hub`:

| Project name | Root directory | Local port | Indexing |
| --- | --- | --- | --- |
| `balanse-web` | `apps/web` | 9000 | Preview: `noindex` (safe default) |
| `balanse-admin` | `apps/admin` | 9001 | Always `noindex` + Deployment Protection |

Each PR should produce two preview URLs (Vercel Git integration).

## Preview env (mock, no backend credentials)

Set on **Preview** for both projects:

```
NEXT_PUBLIC_APP_MODE=mock
NEXT_PUBLIC_SITE_URL=$VERCEL_URL
```

Do **not** set `DATABASE_URL`, `DIRECT_URL`, or `SUPABASE_SERVICE_ROLE_KEY` on Preview.

## Human runbook (Vercel + GitHub)

1. In Vercel (team `josecodegourmets-projects`), import the GitHub repo twice with the root directories above, or accept the projects created by INF.
2. Framework: Next.js. Install: `pnpm install` from the repository root (`cd ../.. && pnpm install` when the root directory is `apps/web` or `apps/admin`). Build: `cd ../.. && pnpm --filter web build` / `pnpm --filter admin build`.
3. **Admin** project → Settings → Deployment Protection → enable **Vercel Authentication** or a shared password. Share access only with Rex and implementers.
4. Optional **Staging**: a `staging` branch aliased on both projects, still mock-mode until wiring.
5. Confirm the GitHub check “Vercel Preview” comments include both URLs.

## Admin not publicly indexable

- `apps/admin/src/app/robots.ts` disallows all crawlers.
- `X-Robots-Tag: noindex, nofollow, noarchive` via middleware and `vercel.json`.
- Deployment Protection is the access control AC; robots headers are defense in depth, not a lock.
