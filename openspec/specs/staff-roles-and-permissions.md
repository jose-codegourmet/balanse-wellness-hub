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
12. Staff provisioning generates a manually shared Supabase invite link without
    sending invitation email. Creation shows a copy-link modal; the staff table
    provides an Invite cell with a direct “Copy link” button for active rows,
    not an overflow-menu action. The button remains visible in mobile cards. The action requires
    `staff.manage` and cannot invite a role beyond the actor's own permissions.
    Confirmed Auth accounts keep their existing credentials; duplicate staff
    creation is rejected. Disabled/system staff and inactive roles cannot be invited.
13. `/auth/set-password` accepts manually shared invite and recovery links, not public signup
    or unauthenticated reset requests. Only form submission consumes the single-use token,
    verifies active staff access and sets a password. Missing/expired/used links,
    password confirmation errors and clipboard failures have recoverable UI.
    Invitation credentials never enter persistent client storage or audit metadata.
14. A separate Reset password cell has a direct Copy link button. It generates
    a Supabase recovery link for an existing active staff account without sending
    reset email or changing the password at generation time. The same staff.manage,
    target-role permission, active-role, and non-system checks as invitations apply.
    The recipient opens the link and chooses a new password, replacing any existing
    password. Confirmed email / prior sign-in do not block this explicit reset action.
    Recovery and invite token types are verified separately and bound to retry proof.
15. Existing staff detail has an Actions menu beside the name with Copy invite link
    and Copy password reset link. These reuse the table endpoints and never send email.
    Inactive staff/roles disable the actions; staff.manage gates the menu.
16. Staff have a private profile avatar (the existing profiles.avatarKey, shared with
    their own customer identity, not their public coach portrait). After the account
    exists, authorized staff managers can upload/replace/remove JPG, PNG or WEBP up to
    5 MiB. Uploads save independently of account fields. Confirmation verifies storage
    metadata and a fresh, unused upload intent bound to target and manager. Reads use
    short-lived signed URLs. Header, directory and navigation use photo/initials;
    navigation shows the signed-in person's name and role, with email in the menu.
17. My profile provides the same upload/replace/remove controls for any active
    interactive staff actor, including roles without staff.manage. Self-service
    POST/DELETE /api/admin/me/photo derive the target exclusively from the verified
    session, never from request body/query IDs. They reuse the private avatar
    validation and owner-bound upload lifecycle. Guest, customer, disabled staff,
    archived roles and system actors cannot use staff self-service.
