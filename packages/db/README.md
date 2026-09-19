# `@balanse/db`

Prisma package for Balanse Wellness Hub (`xydundrayuusqizssgby`).
Business schema: BE-001–BE-024 (enums, identities, catalogue, reservations, RLS, jobs, reports).

```bash
cp .env.example .env
pnpm db:generate
pnpm db:deploy          # hosted or local, after DIRECT_URL is set
BALANSE_ALLOW_DB_SEED=1 pnpm db:seed
```

See `docs/backend/` (migrations, RLS, jobs, seed, contracts, human-only steps).
