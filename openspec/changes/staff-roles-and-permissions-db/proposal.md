# Change: Staff roles database schema, backfill, RLS (#298)

## Why

Wave 1 (#294) landed the domain registry. Wave 2 must store roles/permissions
in Postgres, backfill ADMIN → Super Admin, and enforce least privilege in RLS
without broadening `is_admin()`.

## What

- Normalized `staff_role_definitions`, `permission_definitions`,
  `staff_role_permissions`, and `StaffMember.roleId`.
- Idempotent seed of `PERMISSION_REGISTRY` plus Super Admin / Front Desk /
  Coach (includes `bundles.read` / `bundles.manage`).
- SQL helpers for #292: `has_permission`, coach ownership via
  `session_coaches` + linked Coach, last-Super-Admin lock.
- RLS/RPC updates. Public/customer policies stay. Front Desk/Coach cannot
  read rates/reports/staff/settings through the Data API.
- Docs: `docs/backend/staff-roles.md`, `rls-policies.md`, related DB docs.

## Out of scope

API handler authorization (#292), mocks (#296), admin UI (#295 / #297).
Dropping the leftover `staff_role` enum (later wave). Applying SQL to
`xydundrayuusqizssgby` in this PR.

## Validation

- `pnpm --filter @balanse/db db:generate`
- `pnpm --filter @balanse/db exec prisma validate`
- `pnpm --filter @balanse/db typecheck`
