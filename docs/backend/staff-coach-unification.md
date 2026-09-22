# Staff / coach unification (BE-055)

Amends **BE-003** (`staff_members`), **BE-004** (`coaches`), **BE-038** (admin coach payloads), **BE-042** (admin staff payloads), and **BE-020** (RLS notes). FE counterpart: `FE-ADM-038`. Parent epic: #260.

This is a **contract + schema** ticket. Screens stay mock-only — no `fetch` to `/api/*`.

## Model

Keep `Coach` as the teaching profile (public bio, photo, specialties, `active`, admin-only rates). Keep `StaffMember` as the admin authorisation principal (`role`, `status`, `userId → Profile`).

“Is a coach” is a **capability derived from a nullable one-to-one link**, not a role:

| Side | Field | Notes |
| --- | --- | --- |
| `Coach.staffMemberId` | `String? @unique` | FK → `staff_members.id` |
| `StaffMember.coach` | `Coach?` | Reverse relation |
| HTTP `isCoach` | `boolean` | `Boolean(staff.coach)` |
| HTTP `coachId` | `string \| null` | `staff.coach.id` |
| HTTP `staffId` | `string \| null` | `coach.staffMemberId` |

```prisma
staffMember StaffMember? @relation(
  fields: [staffMemberId],
  references: [id],
  onDelete: SetNull,
  onUpdate: Cascade
)
```

A coach with `staffMemberId = null` stays valid. A staff member with no coach stays a non-teaching admin.

## Rejected alternatives

| Alternative | Why rejected |
| --- | --- |
| Add `COACH` to `StaffRole` | `StaffRole` is **authorisation**. `is_admin()` is `role = ADMIN` + `status = ACTIVE` + `isSystem = false`. Teaching is not admin access. A coach who is not staff must not gain Data API/admin writes; a staff admin who does not teach must not become assignable on `ClassCoach` / `GymSession` just because of a role enum. |
| Merge `Profile` + `StaffMember` + `Coach` into one `Person` | Coaches have **no auth principal** today. Staff require `auth.users` + `profiles`. Sessions, `class_coaches`, and rate snapshots hang off `Coach`. A merged table would force every coach to be a login (out of scope) or a pile of nullable auth columns. The 1:1 link keeps the teaching profile intact. |

`StaffRole` remains `{ ADMIN }` only on the leftover Prisma enum (BE-001). #298 added `staff_role_definitions` + `StaffMember.roleId`; the enum is not authorization truth and is not dropped in this wave. Do not add `isCoach` as a stored column or as a `StaffRole` value. Authorization roles (`super_admin`, `front_desk`, `coach`, custom) live in `@balanse/domain` and stay separate from this teaching link (epic #289 / #294 / #298).

## Unlink / delete semantics

Clearing the link is `UPDATE coaches SET "staffMemberId" = NULL`.

| Action | `onDelete` / effect |
| --- | --- |
| Unlink (`DELETE /api/admin/staff/{id}/coach`) | Sets `staffMemberId` null. **Never** deletes `Coach`. |
| Delete `StaffMember` (no API today) | `ON DELETE SET NULL` on `coaches.staffMemberId`. |
| Delete `Coach` (no API today) | Reverse relation disappears. Coach deletion is restricted while session assignments reference the coach. Classes have no coach association. |
| `ON UPDATE` | `CASCADE` (cuid ids do not change). |

**Never** `ON DELETE CASCADE` from staff → coach. That would wipe `class_coaches` and leave sessions without a teaching profile.

## Disable staff while the coach has future sessions

`POST /api/admin/staff/{id}/disable`:

1. `staff_members.status = DISABLED` (existing: next `resolveActor` is not admin).
2. If a coach is linked, set `coaches.active = false`.
3. **Sessions are untouched** — session coach assignments, snapshots, and bookings stay as they are.
4. New session create still rejects an inactive coach (`inactive_reference`, existing BE-051 rule).

Unlink does **not** deactivate the coach.

## Migration / backfill

Existing seed (`packages/db/prisma/seed.ts`):

| Row | Notes |
| --- | --- |
| `coach_rex` … `coach_francis` | Teaching profiles. `staffMemberId` stays **null**. |
| `staff_members` | Seed does **not** create staff (that requires `auth.users` + `profiles`). A system job actor may exist from earlier SQL. |

Mock (`packages/mock`) already treats Rex as one human in two rows:

| Mock id | Same person |
| --- | --- |
| `staff-rex` | `isCoach: true`, `coachId: "coach-rex"` |
| `coach-rex` | `staffId: "staff-rex"`, photo slug `rex-francis-regis` |

`staff-partner` is staff only (`isCoach: false`).

**Operator backfill (hosted / after staff exist):**

1. Provision the staff account (`POST /api/admin/staff`) if missing.
2. `POST /api/admin/staff/{staffId}/coach` with `{ "coachId": "coach_rex" }` (or the live cuid).
3. Do **not** auto-match on name/email in SQL — Rex is the only known duplicate, and a silent join would mis-link homonyms.

Coaches with no staff account remain valid teaching profiles.

This migration is **not** applied to `xydundrayuusqizssgby` by this PR.

## RLS (no coach principal)

| Object | Read | Write |
| --- | --- | --- |
| `coaches.staffMemberId` | Admin only (base `coaches` table). | Admin only. |
| `coaches_public` | Unchanged — `id, name, specialties, shortBio, photoKey, active`. **No** `staffMemberId`, **no** rates. | — |
| `staff_members` | Admin only. | Admin only (`isSystem = false` on insert/update). |

`public.is_admin()` is Super Admin compatibility only after #298 (active non-system staff with `allAccess` / `builtInKey = super_admin`). It was **not** broadened to every staff member. There is **no** coach JWT / `app_metadata` role. Linking a coach does **not** grant session or rate reads. Own-scope uses `session_coaches` + this link — see [staff-roles.md](./staff-roles.md).

Rate columns stay admin-only (`defaultRate`, `rateType` omitted from `coaches_public`; listed in `PUBLIC_FORBIDDEN_KEYS`). `staffId` is also forbidden on public catalogue payloads.

### Follow-ups (not this ticket)

- Coach authentication / coach portal.
- Coach-scoped RLS for “my upcoming sessions”.
- Payroll, rate history, rate approval.

## HTTP contract (admin)

All routes require an active admin (`requireAdmin`). 422 bodies use the BE-051 shape (`validation_failed` + `fieldErrors[]`).

### Staff payloads (amends BE-042)

Every staff object includes:

```json
{
  "id": "…",
  "name": "Rex Francis Regis",
  "email": "rex@balanse.example",
  "role": "ADMIN",
  "status": "ACTIVE",
  "isCoach": true,
  "coachId": "coach_rex"
}
```

`isCoach` / `coachId` are derived. Prisma `status` stays `ACTIVE` / `DISABLED` (mock FE uses lowercase).

### Coach payloads (amends BE-038)

Every admin coach object includes `staffId` (`string | null`) and **omits** raw `staffMemberId`. Rates remain on the admin payload.

Public `GET /api/public/coaches` is unchanged (view columns only).

### Link / unlink

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| `POST` | `/api/admin/staff/{id}/coach` | `{ "coachId": "<id>" }` | `{ staff, coach: { id, staffId } }` |
| `DELETE` | `/api/admin/staff/{id}/coach` | — | `{ staff }` with `isCoach: false`, `coachId: null` |

Idempotent: linking the same pair again is 200. Unlinking when already clear is 200.

| Case | Status | `fieldErrors[0]` |
| --- | --- | --- |
| Missing `coachId` | 422 | `path: coachId`, `code: required` |
| Staff not found / system actor | 404 | `staff_not_found` |
| Coach not found | 404 | `coach_not_found` |
| Staff `DISABLED` | 422 | `path: staffId`, `code: inactive_reference` |
| Staff already linked to another coach | 422 | `path: coachId`, `code: already_linked` |
| Coach already linked to another staff | 422 | `path: coachId`, `code: already_linked` |

Audit: `staff.coach.link`, `staff.coach.unlink`, `staff.disable` (metadata includes `coachDeactivated`, `sessionsUntouched`).

## FE-ADM-038 field check

| FE / domain field | Server |
| --- | --- |
| `AdminStaff.isCoach` | Derived boolean on staff payloads |
| `AdminStaff.coachId` | Linked `Coach.id` or `null` |
| `AdminCoach.staffId` | `Coach.staffMemberId` or `null` |
| `StaffRole` | Leftover `"ADMIN"` enum; HTTP role for #292 is `StaffRoleDefinition.key` |
| Mock `staff-rex` ↔ `coach-rex` | Documented backfill pair; IDs differ (kebab vs seed `coach_rex`) |

If the FE mock later diverges, **this contract wins**.

`FE-ADM-038` mock unlink (clearing `isCoach` on `upsertAdminStaff`) also sets `coach.active = false` so session history stays on an inactive teaching profile. HTTP `DELETE /api/admin/staff/{id}/coach` still only clears the link. Disable-staff deactivates a linked coach on both layers.
