# `@balanse/db`

Prisma package for the Balanse Wellness Hub Supabase project (`xydundrayuusqizssgby`).
The INF baseline is `AppMeta` (`app_meta`). Business models land in BE-001+.

```bash
cp .env.example .env
# fill DATABASE_URL (6543, pgbouncer=true) and DIRECT_URL (5432)
pnpm db:generate
pnpm db:smoke
pnpm db:migrate:create -- --name be001_add_enums
pnpm db:deploy
```

See `docs/backend/migrations.md`.
