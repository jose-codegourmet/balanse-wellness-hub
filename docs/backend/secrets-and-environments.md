# Secrets management and environment matrix

**INF-006.** Coach rates and coach costs are admin-only [R67, R68]. A leaked **service-role** key or `DATABASE_URL` is a **privacy incident**, not only a security incident: it bypasses RLS and can expose compensation data.

## Matrix

| Secret | Local | CI (GitHub Actions) | Preview (Vercel) | Staging / Production (Vercel) | Owner | Rotate when |
| --- | --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env*` | optional (not required for mock CI) | allowed (public) | required | Infra | Project moved |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env*` | optional | allowed if not mock-only | required | Infra | Key leaked or Dashboard rotate |
| `DATABASE_URL` (pooler) | `packages/db/.env` | secret, only DB jobs | **omit** | server-only | Project owner | Password reset / staff offboarding |
| `DIRECT_URL` | `packages/db/.env` | secret, migrate jobs only | **omit** | migrate job / owner laptop | Project owner | Same as DB password |
| `SUPABASE_SERVICE_ROLE_KEY` | optional local, **never** `NEXT_PUBLIC_*` | secret, never logs | **omit** | server-only | Project owner | Any suspicion of leak; offboarding |
| Google OAuth client secret | not in repo | n/a | n/a | Supabase Auth provider settings | Project owner | GCP rotate / leaked |
| Vercel / GitHub tokens | n/a | `GITHUB_TOKEN` (built-in) | n/a | Vercel team | Team admin | Token compromise |
| Preview access password (admin) | n/a | n/a | Vercel Deployment Protection | n/a | Team admin | Reviewer change |

## Guardrails

- `pnpm secrets:scan` (pre-commit + CI) fails if a service-role JWT or `sb_secret_*` appears in tracked files, or on a `NEXT_PUBLIC_*` line.
- Preview builds set `NEXT_PUBLIC_APP_MODE=mock` and must not define `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL`.

## Rotation runbook

1. **Identify scope:** publishable vs service-role vs DB password vs Google secret.
2. **Dashboard:** Project Settings → API (keys) or Database (password) or Auth → Providers (Google).
3. **Replace** the value in every store in the matrix row (local tell developers in a private channel — do not paste the new secret into git/chat).
4. **Revoke** the old key/password immediately after the new one works.
5. If the secret was a **service-role or DB URL**: treat as a privacy incident. Invalidate sessions if needed, check Storage and `app_meta`/future financial tables for unexpected reads, and notify the project owner.
6. Record date + reason in the private ops log (not this repo).
