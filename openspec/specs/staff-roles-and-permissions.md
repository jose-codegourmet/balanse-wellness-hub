# Spec: Staff roles and permissions

Wave 1 contract for epic #289 (ticket #294). Downstream tickets import
`@balanse/domain` — they do not copy permission lists.

## Requirements

1. Authorization vocabulary is the `PERMISSION_KEYS` registry in
   `packages/domain/src/permissions.ts`. Unknown strings are rejected.
2. Built-in roles are `super_admin`, `front_desk`, and `coach` with the
   exact default matrices in `packages/domain/src/roles.ts`. Super Admin is
   all-access for current and future keys. Front Desk and Coach are
   allow-lists and must not be silently widened.
3. Custom roles use `StaffRoleDefinition` (dynamic key, display name,
   permission keys from the registry). The legacy `StaffRole` enum (`ADMIN`)
   is not authorization truth.
4. Teaching capability stays `isCoach` / `coachId` from the staff↔coach
   link. The Coach role requires that link; it does not replace it.
5. Navigation, page routes, page actions, and `/api/admin/*` handlers share
   `packages/domain/src/admin-access.ts`. Every current admin surface is
   mapped, including BE-058 bundle routes via `bundles.read` /
   `bundles.manage`. Mixed endpoints declare `includeFieldsIf`. The payments
   refunds tab is `refunds.read`, not `payments.read`.
6. Helpers are deny-by-default: `hasPermission`, `hasAnyPermission`,
   `hasAllPermissions`, `hasScopedPermission`, `firstPermittedAdminRoute`,
   `roleLabel`, `sensitivePermissionsOf`, `violatesLastSuperAdminInvariant`.
   Own-scope never implies all-scope.
7. Wave 1 (#294) shipped the domain registry, seeded matrices, and
   `ADMIN_*_ACCESS` maps. Later waves consume those modules.
8. Role catalogue screens (#297) live at `/staff/roles`, `/staff/roles/new`,
   and `/staff/roles/[roleId]`. Staff assignment uses active roles from the
   mock adapter, keeps Role separate from `isCoach`, and blocks Coach-without-link
   plus last-Super-Admin / self-lockout. UI does not copy permission lists.
9. Wave 2 (#298) shipped Prisma models `StaffRoleDefinition`,
   `PermissionDefinition`, `StaffRolePermission`, `StaffMember.roleId`,
   expand/seed/backfill SQL, `has_permission` / `owns_session` helpers,
   last-Super-Admin locking, and RLS/RPC gates. `is_admin()` stays Super
   Admin only. The leftover `StaffRole` enum is not dropped yet.
10. Wave 3 (#292) shipped API staff-actor resolution, `ADMIN_API_ACCESS`
    enforcement, sensitive response shaping, and role
    CRUD/clone/archive/assignment endpoints.
11. Wave 4 (#291) shipped coach-owned schedule, roster, attendance, and
    dashboard query filters. Wave 5 (#293) is integration closeout only —
    see `docs/backend/authorization-closeout.md`.
