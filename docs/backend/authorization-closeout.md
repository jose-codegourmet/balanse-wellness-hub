# Authorization closeout (#293 / epic #289)

Convergence notes after children #294, #298, #296, #292, #295, #297, and #291
landed on `main`. This ticket does **not** redesign the permission matrix.
Canonical keys remain `PERMISSION_KEYS` in `@balanse/domain`.

## Child outcomes

| Ticket | PR | Layer |
| --- | --- | --- |
| #294 | #309 | Domain registry + seeded matrices + `ADMIN_*_ACCESS` |
| #298 | #310 | Prisma roles, expand/backfill SQL, RLS helpers |
| #296 | #311 | Mock identities, adapter gates, query fingerprints |
| #292 | #312 | Staff actor, API dispatch, role CRUD, last-SA SQL call |
| #295 | #314 | Shell, nav, route/action, sensitive UI |
| #297 | #313 | Role catalogue + staff assignment |
| #291 | #315 (`9402ae3`) | Coach-owned schedule / roster / attendance / dashboard |
| #293 | this PR | Integration fixes, audit/lockout, docs, QA |

## Permission consistency

Compared permission-by-permission across domain, SQL seed (`20260922181000`),
Prisma seed (now fills empty Front Desk / Coach joins; does not rewrite
trigger-protected matrices), RLS helpers, `ADMIN_API_ACCESS` / dispatch,
mock adapter, query fingerprint (`adminAuthScope` +
`mockStaffAuthorizationFingerprint`), nav/route/action maps, sensitive
shaping, and coach own-scope.

`POST /api/admin/staff` now requires `staff.manage` (matches
`ADMIN_API_ACCESS` and the mock). Role grant still uses
`assertCanGrantPermissions`.

Session report / session-performance payloads omit sales and coach-cost
fields unless the actor holds `reports.sales.read` /
`reports.coach_costs.read`. JWT report RPCs zero those columns
(`20260922181200`). HTTP Prisma calls still shape in the handler.

Schedule **writes** (`schedule.update` / `schedule.cancel`) stay
all-sessions when the key is granted. Built-in Coach does not have those
keys. Own-scope is for read / roster / attendance only.

Route `requiresOwnership` is enforced at page, mock, and API (roster
template), not inside `AdminGuard`. Direct URLs still fail at the data
layer.

## Last Super Admin

| Layer | Behavior |
| --- | --- |
| SQL | `lock_and_count_active_super_admins` + `assert_last_super_admin_safe` (`FOR UPDATE`) |
| API | Same helper inside `$transaction`; Prisma count fallback if the helper is not deployed |
| Mock / UI | `violatesLastSuperAdminInvariant` + `roleHoldsSuperAdminAccess`; disable control hidden when last SA |
| Audit | Rejected disable/demote writes `staff.last_super_admin.rejected` |

Concurrent last-SA protection is guaranteed only after #298 SQL is applied.
The Prisma fallback is a single-statement count, not `FOR UPDATE`.

## Audit events

API `writeAudit` records actor (`actorId` + `metadata.actorStaffId` /
role), target (`entityId` + `metadata.targetStaffId` when relevant),
before/after (`metadata.before` / `metadata.after` and status columns),
and time (`occurredAt` default). Covered: role create/update/clone/archive,
staff provision/assign/disable, coach link/unlink, rejected last-SA,
customer sensitive read.

No staff **reactivate** endpoint exists (out of scope). Mock harness has no
append-only staff/role audit log (preview-only).

## Migration / backfill

`20260922181000` expands tables, seeds the registry + three built-ins,
backfills interactive `ADMIN` staff to Super Admin, then makes `roleId`
NOT NULL. Staff ids, `userId`, coach links, status, and audit FKs are
preserved. The leftover `staff_role` enum column is **not** dropped.

`20260922181100` adds helpers, last-SA lock, RLS/RPC. `is_admin()` stays
Super Admin only.

`20260922181200` (#293) zeros JWT report sales/cost columns without the
matching key.

These SQL files are still **staged** for hosted project `xydundrayuusqizssgby`
until migration history is reconciled. Apply expand → helpers → report
fields, then re-run `pnpm --filter @balanse/db db:seed` (registry upsert
only; Front Desk / Coach matrices stay trigger-protected).

## Stale cache / identity switch

Admin query keys are `["admin", adminAuthScope(principal), …]`. The scope
includes staff id, status, role, coach link, permission set, and role
revision. `useSwitchAuthorizedIdentity` calls `removeAuthorizedAdminCache`
(remove `["admin"]` + `clear`) and `router.replace`s
`firstPermittedAdminRoute`. Privileged → Front Desk / Coach / custom /
disabled / guest / customer cannot keep Super Admin cache.

Harness identities (`data-testid="harness-identity"`): Rex (Super Admin +
coach), Partner (Front Desk), Ephraim (Coach role + coach), disabled staff,
Community Host (custom), guest, customer.

## Negative paths

| Path | Expected |
| --- | --- |
| Direct URL without permission | `AccessDenied` + first allowed home |
| Crafted `/api/admin/*` | Dispatch 403 if unmapped or missing key |
| Disabled staff | Next request denied (`disabled_staff` / 403) |
| Archived role assign | `archived_role` |
| Coach other session id | ownership 403; roster not in own query |
| Front Desk rates / reports | omitted / 403 |
| Privilege escalation | `privilege_escalation` |
| Last Super Admin | 403 + rejected audit |
| Privileged → limited switch | cache drop + redirect |

## Parent #289 acceptance reconciliation

### Roles/staff

- [x] Seeded roles match domain defaults (SQL + seed Super Admin snapshot; FD/Coach from migration / empty-join seed).
- [x] Custom role from grouped checklist (#297).
- [x] Clone a role (#297 / #292).
- [x] Built-in keys cannot change/delete (triggers + API).
- [x] Assigned custom role cannot archive.
- [x] Staff form loads/summarizes roles.
- [x] Coach role requires linked coach.
- [x] `isCoach` remains derived and composes with every role.
- [x] ADMIN staff backfill to Super Admin without identity/link rewrite (SQL notes).

### Enforcement

- [x] Every current admin route/API is in `admin-access.ts`.
- [x] Missing permission denies (dispatch + mock).
- [x] Nav, direct route, action, API, response, and RLS agree on the matrix (writes with `schedule.update` are global by design).
- [x] Unauthenticated / customer / disabled / forbidden differ.
- [x] Front Desk allow-list only.
- [x] Coach own sessions/rosters/attendance (#291).
- [x] Coach cannot ID-swap another coach’s session.
- [x] Read does not imply mutation.
- [x] Service-role handlers authorize before data access.

### Sensitive data

- [x] Rates unavailable to Front Desk/Coach (API shape, mock strip, RLS column grants).
- [x] Sales/refunds/costs/financial dashboard need explicit permission.
- [x] Safe projections omit compensation.
- [x] Role switch cannot leak Super Admin cache.
- [x] Counts/metrics hide forbidden aggregates (dashboard + reports).

### Safety/audit

- [x] Last active Super Admin cannot be disabled/demoted/deleted (SQL + API + mock + UI).
- [x] Concurrency: SQL `FOR UPDATE` when helpers are deployed; Prisma fallback documented.
- [x] Changes audited with actor, target, before/after, timestamp (API).
- [x] Disabled staff lose access next request.
- [x] Removing session assignment removes coach access (#291).
- [x] Archived/disabled roles cannot be assigned.

### Repository/docs

- [x] Domain, Prisma/migrations, mocks, API, RLS, UI, and listed docs agree.
- [x] `03-roles-and-permissions.md`, staff-management spec, RLS, staff-coach unification, roadmap, future-scope, OpenSpec, API docs updated.
- [x] Forms follow `docs/ways-of-working.md` (no new form pattern).
- [x] Mock UI uses query layer / MockDataAdapter.
- [x] No new test suites.

## Residual known gaps

1. Hosted Supabase still needs a reviewed apply of #298/#293 SQL; advisors on
   the live project are pre-migration drift (see `staff-roles.md`).
2. Leftover `StaffRole` enum / `staff_members.role` column not dropped.
3. Prisma last-SA fallback is not row-locked.
4. No staff reactivate API or mock staff audit log.
5. OpenAPI JSON does not embed per-operation permission keys; mapping lives
   in `ADMIN_API_ACCESS` and `docs/backend/api-routes.md`.
6. Browser QA of all identities depends on a running admin preview; exercise
   the harness list above after deploy.
