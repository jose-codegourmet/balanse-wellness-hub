# Human-only follow-ups (schema track)

Safe automation applied via Prisma migrations when `DIRECT_URL` is available. Still confirm in the Dashboard:

1. **pg_cron** — enable if the migration notice said it was skipped; job name `balanse-expire-holds-promote`.
2. **Auth trigger** — `on_auth_user_created` on `auth.users` creates `profiles`. After first real signup, confirm one profile row.
3. **Storage probes** — anonymous read of `payment-proofs` must fail; `coach-photos` public read once an object exists.
4. **First admin** — insert a `staff_members` row linked to a real `auth.users` / `profiles` id. There is no public registration path for staff.
5. **`_prisma_migrations` RLS** — advisor may flag this history table. Do not expose it through the Data API; optional `ENABLE ROW LEVEL SECURITY` with no policies if you want it locked down (coordinate so Prisma still migrates as `postgres`).
