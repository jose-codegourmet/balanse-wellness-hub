# Admin Portal — Staff Management

```text
STAFF MANAGEMENT                    [Add Staff]
Name (avatar if coach) | Role              | Coach | Status | Action
Rex                    | Super Admin · Coach | Coach | Active | View/Edit
Partner                | Front Desk          |  —    | Active | View/Edit

STAFF DETAIL
Name
Email
Role (authorization — Super Admin / Front Desk / Coach / custom)
Status
[This staff member is a coach]  → link to /coaches/[coachId]
Permission summary (from the assigned role)
[Save] [Disable Access]
```

Role text comes from `roleLabel` / future staff capability helpers in
`@balanse/domain`. Do not hardcode `"Admin"`. The Coach column is a faceted
filter on the derived `isCoach` capability — not the authorization role.

No public admin registration.

## Role management (#297)

- `/staff/roles` — catalogue with loading, empty, error, and forbidden states
- `/staff/roles/new` — create or clone (`?from=roleId`)
- `/staff/roles/[roleId]` — view built-in / edit custom / archive unassigned custom

List: name, built-in/custom, active/archived, assigned staff count,
permission count, view/edit and clone.

Create/edit form: name, description, grouped checklist from
`PERMISSION_REGISTRY` (never a local key list), select/clear group,
sensitive-permission warnings, clone-from-role, live accessible-pages and
sensitive-data summary. Built-in keys cannot change. Zero-permission roles
cannot save. Mock writes go through `getAdminStaffRoles` /
`upsertAdminStaffRole` — no UI `/api` or Supabase.

## Assignment rules

- One role per staff.
- Coach authorization role requires a linked coach profile.
- `isCoach` / `coachId` stay a separate teaching link and compose with every role.
- Last active Super Admin cannot be disabled, demoted, deleted, or stripped
  of all-access behavior (`violatesLastSuperAdminInvariant`). The staff
  detail form hides `[Disable Access]` when that invariant would fire.
- Archived or disabled roles cannot be assigned.
- Warn when changing the current user’s role or access.

## Financial and sensitive access

Only explicit permissions grant:

- coach compensation rates (`coach_rates.read` / `coach_rates.manage`)
- sales reports (`reports.sales.read`)
- refund totals (`refunds.read` / `refunds.manage`)
- coach-cost reports (`reports.coach_costs.read`)
- financial dashboard (`dashboard.financial.read`)
- capacity/utilization reporting (`reports.capacity.read`)

Front Desk and Coach defaults do not include those keys. Super Admin has
all-access semantics.

## Coach capability (BE-055 / FE-ADM-038)

A staff member may optionally be linked to a `Coach` teaching profile.
“Is a coach” is derived from that link (`isCoach` / `coachId`) — it is **not**
an authorization role and must not be added to the legacy `StaffRole` enum.

Disabling staff access while a linked coach has future sessions deactivates
the **coach** (`active = false`) and leaves assigned sessions untouched.
Unlinking must never delete the coach row.
See `docs/backend/staff-coach-unification.md`.
