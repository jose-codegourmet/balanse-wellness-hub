# Change: Staff roles and permissions — Wave 1 contract (#294)

## Why

Jose activated epic #289. The admin app is still all-or-nothing `ADMIN`.
Wave 1 must land first so database, mock, API, and UI tickets consume one
permission registry.

## What

- Canonical permission registry and seeded Super Admin / Front Desk / Coach
  matrices in `@balanse/domain`.
- Shared actor/role types, labels, route-to-permission metadata, and pure
  helpers (membership, any/all, scoped own-vs-all, first permitted route,
  sensitive grouping, last-Super-Admin invariant).
- Docs: `docs/business-requirements/03-roles-and-permissions.md`,
  `docs/screen-specs/admin/03-staff-management.md`, this OpenSpec, and
  role/permission sections of `docs/MVP-ROADMAP.md`.

## Decisions

- Permission keys match #289 verbatim. `bundles.read` / `bundles.manage`
  are the only additions, required to name current BE-058 admin routes
  without reusing an unrelated permission.
- Super Admin is all-access semantics, not a stale stored list.
- Authorization role stays separate from `isCoach` / `coachId`.
- Front Desk and Coach defaults stay exact allow-lists.

## Out of scope

Prisma / RLS, API handlers, mock identities, admin screens and nav gating
(#298, #296, #292, #297, #295).

## Validation

- `pnpm --filter @balanse/domain typecheck`
- `pnpm --filter @balanse/domain lint` (or `pnpm lint` on the touched files)
