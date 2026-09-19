# Environment variable reference

**INF-002.** Placeholders only in `*.env.example`. Copy to `.env` / `.env.local` locally. Never commit real secrets.

| Variable | Consumers | Public? | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `apps/web`, `apps/admin`, root Turbo `globalEnv` | Yes | `https://xydundrayuusqizssgby.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `apps/web`, `apps/admin` | Yes | Dashboard → API → publishable key (`sb_publishable_…`). Legacy anon JWT is compatibility-only. |
| `NEXT_PUBLIC_SITE_URL` | `apps/web`, `apps/admin` | Yes | Origin used for Auth redirects (`http://localhost:9000` / `:9001`). |
| `NEXT_PUBLIC_APP_MODE` | `apps/web`, `apps/admin` | Yes | `mock` for INF-008 previews. Later wiring uses `live`. |
| `NEXT_PUBLIC_ENABLE_MOCK_HARNESS` | `apps/web`, `apps/admin` | Yes | FE mock role switcher. |
| `JABKIT_REGISTRY` | `apps/web`, `apps/admin` | Yes | Jabkit component registry URL. |
| `DATABASE_URL` | `packages/db` (Prisma Client, smoke script) | **No** | Pooled Postgres. Port **6543**, user `postgres.<ref>`, query `?pgbouncer=true`. |
| `DIRECT_URL` | `packages/db` (Prisma migrate, `db:ensure-buckets`) | **No** | Direct / session Postgres. Port **5432**. Required for migrations. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only future API routes; **not** read by the INF app scaffolds | **No** | Never `NEXT_PUBLIC_*`. Leak is a privacy incident (coach rates). See `secrets-and-environments.md`. |

## Files

| File | Purpose |
| --- | --- |
| `.env.example` | Root convenience copy (Turbo `globalEnv`) |
| `packages/db/.env.example` | Prisma CLI (`packages/db/.env`) |
| `apps/web/.env.example` | Next customer app (`apps/web/.env.local`) |
| `apps/admin/.env.example` | Next admin app (`apps/admin/.env.local`) |

## Clean-checkout generate

```bash
cp .env.example .env
cp packages/db/.env.example packages/db/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
pnpm install
pnpm --filter @balanse/db db:generate
```

`db:generate` does not need a live database. Connection smoke **does**:

```bash
# after filling real DATABASE_URL + DIRECT_URL in packages/db/.env
pnpm --filter @balanse/db db:smoke
```
