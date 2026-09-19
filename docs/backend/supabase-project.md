# Supabase project of record

**INF-001.** Do not create another Supabase project for this MVP.

| Field | Value |
| --- | --- |
| Name | Balanse Wellness Hub |
| Project ref | `xydundrayuusqizssgby` |
| Region | `ap-southeast-1` |
| API URL | `https://xydundrayuusqizssgby.supabase.co` |
| DB host (direct) | `db.xydundrayuusqizssgby.supabase.co` (port `5432`) |
| DB host (pooler) | Supabase session/transaction pooler for this project (port `5432` session / `6543` transaction). Confirm the exact hostname in Dashboard → **Connect**. Typical pattern: `aws-0-ap-southeast-1.pooler.supabase.com` with user `postgres.xydundrayuusqizssgby`. |
| Postgres | **17** (`17.6.1.166` at INF-001 verification) |
| Organization | `jose-codegourmet's Org` (`bfbvsttaafxhzciutyey`), Free plan |
| Status at INF-001 | `ACTIVE_HEALTHY`; `public` schema empty; zero applied migrations; zero storage buckets |

## Access owners

| Role | Who | How they authenticate |
| --- | --- | --- |
| Organization / project owner | Coach Rex’s developer (`jose-codegourmet` GitHub / matching Supabase org) | Personal Supabase login. Holds billing and owner settings. |
| Additional developers | Invited as project members with the least privilege that still lets them work (typically Developer, not Owner) | Individual Supabase accounts. **Never share the service-role key in chat, issues, or git.** |
| CI / hosting | GitHub Actions secrets and Vercel project env (server-only) | Repository admins rotate these. Preview deployments must not receive the service-role key (see `docs/backend/preview-and-staging.md`). |

Publishable / anon keys may live in local `.env*` and in `NEXT_PUBLIC_*` hosting env. The **service role** and database password stay in:

- each developer’s local `packages/db/.env` (gitignored)
- GitHub Actions repository secrets (only jobs that must talk to the live DB)
- Vercel **Production / Staging** server env — never Preview mock builds

## Environment strategy

**Decision: one shared hosted project for schema + Auth + Storage, plus local app processes. PR previews do not get a second Supabase project or Supabase Branch.**

Rationale:

1. The product already has a named project (`xydundrayuusqizssgby`). Creating a second project would split Auth users, Storage, and migration history — forbidden by INF-001.
2. The org is on the **Free** plan. Persistent preview databases / automatic Supabase branches are not the MVP path.
3. INF-008 previews run in **mock mode** with no backend credentials so Coach Rex can review screens without touching production data.
4. Schema changes go through Prisma migrations and are applied to this project with `prisma migrate deploy` after review (`docs/backend/migrations.md`).
5. Optional later: when the org is on a plan that supports Supabase Branches, we can add a preview database per PR. Until then, do not create extra projects.

Local `pnpm dev` talks to this same project once a developer copies `.env.example` → `.env` with their own least-privilege credentials.
