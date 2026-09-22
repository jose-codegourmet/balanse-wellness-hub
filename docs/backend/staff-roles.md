# Staff roles and permission helpers (#298)

Wave 2 of epic #289. Consumes `@balanse/domain` (`PERMISSION_KEYS`,
`PERMISSION_REGISTRY`, `BUILT_IN_ROLE_DEFINITIONS`,
`FRONT_DESK_PERMISSION_KEYS`, `COACH_PERMISSION_KEYS`). Do not copy those
lists into API or UI tickets.

Prisma is the schema source of truth. These SQL files are **staged and not
applied** to shared project `xydundrayuusqizssgby` by this ticket.

| File | Stage |
| --- | --- |
| `packages/db/prisma/schema/roles.prisma` | Models |
| `20260922181000_be289_298_expand_role_permissions` | Expand tables, seed, ADMIN → Super Admin backfill, `roleId` NOT NULL |
| `20260922181100_be289_298_permission_helpers_rls` | Helpers, last-Super-Admin primitive, RLS/RPC |

The leftover `staff_role` enum (`ADMIN`) stays on `staff_members.role` until a
later wave can drop it safely. Authorization truth is `staff_members.roleId`.

## Seeded rows

Stable ids (idempotent):

| Role | `id` | `key` / `builtInKey` |
| --- | --- | --- |
| Super Admin | `role_super_admin` | `super_admin` (`allAccess`) |
| Front Desk | `role_front_desk` | `front_desk` |
| Coach | `role_coach` | `coach` |

Permission rows use the registry key as `permission_definitions.id`.
`bundles.read` / `bundles.manage` are included.

Existing `staff_members` rows (including the system actor) keep their ids,
`userId`, coach link, status, and audit FKs. Interactive `ADMIN` rows backfill
to Super Admin. `is_admin()` still excludes `isSystem`.

`pnpm --filter @balanse/db db:seed` re-upserts the registry and Super Admin
snapshot from `@balanse/domain`. It does not rewrite the Front Desk / Coach
allow-lists (database triggers protect those matrices).

## Helpers for #292

Private (`app_private`, no Data API execute):

| Function | Meaning |
| --- | --- |
| `has_permission(uid, key)` | Deny-by-default. Super Admin `allAccess` wins. Disabled / system / archived deny. |
| `staff_has_permission(staff_id, key)` | Same, via `staff_members.userId`. |
| `linked_coach_id(uid)` | `coaches.staffMemberId` for the staff row. Never name/email. |
| `staff_linked_coach_id(staff_id)` | Same from a staff id. |
| `owns_session(uid, session_id)` | `session_coaches.coachId` = linked Coach. |
| `owns_booking_session(uid, booking_id)` | Own-scope via the booking’s session. |
| `has_scoped_permission(uid, own_key, all_key, session_id)` | All-scope or (own-scope **and** ownership). Own never implies all. |
| `assert_permission(uid, key)` | Raises `42501` `permission_denied`. |
| `assert_staff_scoped_permission(staff_id, all_key, own_key, session_id)` | Attendance / roster mutations. |
| `assert_last_super_admin_safe(staff_id, action)` | Locks active Super Admin staff (`FOR UPDATE`) then rejects `disable` / `demote` / `delete` / `strip_all_access` when one remains. |
| `lock_and_count_active_super_admins()` | The lock + count primitive. |

Public (granted to `authenticated`, JWT `auth.uid()`):

| Function | Meaning |
| --- | --- |
| `has_permission(key)` / `has_permission(uid, key)` | Data API / SQL clients. |
| `owns_session(session_id)` | Coach own-scope. |
| `linked_coach_id()` | Linked Coach.id or null. |
| `assert_last_super_admin_safe(staff_id, action)` | Requires `staff.manage` (or Super Admin). |

`public.is_admin()` remains **Super Admin compatibility only**: active,
non-system staff whose role is `allAccess` or `builtInKey = super_admin`.
It is **not** “any staff”. Do not broaden it.

`check_in_booking` / `mark_no_show` call
`assert_staff_scoped_permission(..., attendance.manage.all, attendance.manage.own, session_id)`
inside the row lock.

Report functions stay **revoked** from `anon` / `authenticated`. If
`auth.uid()` is present they also require the matching `reports.*` key.
Prisma/service-role (`auth.uid()` null) still bypasses that JWT check —
#292 must authorize before calling.

## Archive / assignment invariants (triggers)

- Built-in key / `allAccess` / status cannot change; built-ins cannot delete.
- Assigned custom roles cannot archive or delete.
- Archived roles cannot assign.
- Coach authorization role requires a linked `Coach` row.
- System actor cannot be disabled, demoted, or deleted.
- Last active non-system Super Admin cannot be disabled, demoted, or deleted.

Custom roles are ordinary `staff_role_definitions` rows (`builtIn = false`).
They never need a `StaffRole` enum value.

## Hosted project / advisors (2026-09-22)

SQL was **not** applied to `xydundrayuusqizssgby`. Prisma validate/generate ran
against the schema only. Re-run `get_advisors` after a reviewed deploy.

Findings on the **current** hosted project (before this migration):

| Advisor | Notes |
| --- | --- |
| `rls_enabled_no_policy` (INFO) | Several public tables report RLS on with no policies (`bookings`, `sessions`, `staff` is not in that list). That is **drift vs repo SQL** (BE-020 policies exist in git). Do not “fix” by broadening `is_admin()`. Reconcile history before deploy. `app_meta` / `developer_config` / `app_private.legacy_class_coaches` with no policies is intentional (Data API closed). |
| `function_search_path_mutable` (WARN) | Pre-existing `app_private.new_id`, `opaque_reference`, `booking_transition_allowed`, `session_matches_report_filters`. Not introduced here. New helpers set `search_path`. |
| `rls_disabled_in_public` (ERROR) | `public._prisma_migrations` — Prisma history table; leave as-is. |
| `anon_security_definer_function_executable` / authenticated counterpart (WARN) | Live still grants execute on `is_admin`, some `report_*`, `session_consumed_capacity`, `transition_booking`. This migration **re-revokes** report functions and adds JWT permission checks when `auth.uid()` is present. `is_admin` / `has_permission` remain callable (boolean, deny-by-default). |
| Unindexed FKs / unused indexes (INFO) | Pre-existing; new FKs (`roleId`, permission joins) are indexed. |
| `multiple_permissive_policies` (WARN) | Pre-existing on `class_marketing_coaches`. New tables add overlapping SELECT/ALL policies for the same staff keys by design (read vs write). Acceptable until a later policy-consolidation pass. |
