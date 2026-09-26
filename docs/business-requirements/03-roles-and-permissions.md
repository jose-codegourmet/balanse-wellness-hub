# 03 — Roles and Permissions

Canonical keys, seeded matrices, and helpers live in `@balanse/domain`
(`permissions.ts`, `roles.ts`, `authorization.ts`, `admin-access.ts`).
UI, API, mocks, and the database must import those modules. Do not invent
permission strings in the browser.

The legacy `StaffRole` enum (`ADMIN` only) is **not** authorization truth.
#298 stores roles in `staff_role_definitions` and `StaffMember.roleId`.
The enum column remains until a later wave can drop it.

---

## Invariants

1. **Deny by default.** Missing role/permission, disabled role or staff, a
   system actor, or unresolved coach ownership means no access.
2. **Server authorization is canonical.** Client checks are UX only.
3. **Own-scope never implies all-scope.** `schedule.read.own` does not grant
   `schedule.read.all` (same for roster and attendance).
4. **Sensitive data needs an explicit permission.** Rates, costs, sales,
   refund totals, and financial reports are never implied by a broader read.
5. **Last Super Admin.** The last active non-system Super Admin cannot be
   disabled, demoted, deleted, or stripped of all-access behavior.
6. **Role ≠ coach capability.** Authorization answers what staff may do.
   `isCoach` / `coachId` remain the teaching link from
   `docs/backend/staff-coach-unification.md`. Never infer permissions from a
   public Coach row, name/email matching, JWT metadata, or `isCoach` alone.

---

## 1. Guest

A guest is an unauthenticated visitor.

### Can

- Open the public booking/calendar experience.
- Browse dates.
- View scheduled classes.
- View basic session information.
- View whether slots are available.
- See remaining capacity.

### Cannot

- Reserve a slot.
- Join a waitlist.
- Upload payment proof.
- Request cancellation/reschedule.
- View another customer's booking information.

### Conversion point

When a guest attempts to reserve, the guest must authenticate or create an account.

---

## 2. Customer

A customer is an authenticated individual booking for themselves.

### Can

- Browse classes.
- Reserve eligible sessions.
- Join a waitlist when appropriate.
- Select supported payment method.
- Upload GCash payment proof.
- Select Pay at Counter.
- View their own booking statuses.
- View confirmed bookings.
- Submit cancellation requests.
- Submit reschedule requests.
- Book multiple sessions on the same day.
- Accept required waiver/policy documents.

### Cannot

- Book for another person.
- Override capacity.
- Confirm their own payment.
- Confirm their own booking.
- Process their own refund.
- Change coach schedules.
- Check themselves in through admin controls.
- Edit developer-controlled business settings.

---

## 3. Staff authorization roles

Staff hold **one** role. Custom roles are created from the canonical
permission checklist. Multiple roles per staff and per-user overrides are
out of scope.

### 3.1 Super Admin (`super_admin`)

- Every current and future permission (all-access semantics).
- Protected built-in key; not editable or deletable.
- At least one active non-system staff member must always hold it.

Initial operators: Coach Rex and Coach Rex’s partner. They backfill to this
role; they are not a special case in code.

### 3.2 Front Desk (`front_desk`)

Allowed:

- `dashboard.operations.read`
- `schedule.read.all`
- `roster.read.all`
- `attendance.manage.all`
- `bookings.read` / `bookings.confirm` / `bookings.reject`
- `payments.read` / `payments.review` / `payments.record_cash`
- `cancellations.read` / `cancellations.manage`
- `reschedules.read` / `reschedules.manage`
- `customers.read`
- `classes.read`
- `coaches.read` (no rates)
- `events.read` (#319; view session events, including internal notes)

Not allowed by default:

- `events.manage` (publish, cancel, archive, or edit an event)
- schedule create / update / cancel / recurrence
- coach rates
- refunds
- financial dashboard or reports
- class / coach / bundle mutation
- staff / role administration
- settings / content / policies / payment QR

Do not silently widen this matrix. Use a custom role for different access.

### 3.3 Coach (`coach`)

Allowed:

- `dashboard.operations.read` (coach-scoped operational dashboard)
- `schedule.read.own`
- `roster.read.own`
- `attendance.manage.own`

Not allowed: global schedule, events, bookings/payments/refunds/requests,
customer directory outside assigned rosters, rates (including own rate),
catalogue mutation, reports, staff/roles/settings, schedule edit/cancel.

**Own** means a `session_coaches` assignment references the coach linked to
the signed-in `StaffMember`. Never match names or emails.

The Coach role requires a linked coach profile. It does **not** replace
`isCoach`. A staff member may be Super Admin + coach, Front Desk + coach,
Coach-role + coach, or a non-teaching Super Admin / Front Desk.

### 3.4 Custom roles

- Stable immutable key; editable display name/description.
- Permissions only from `PERMISSION_KEYS`.
- At least one permission required.
- Cannot impersonate a built-in by key or display name.
- Actor may grant only permissions they possess unless Super Admin.
- Built-ins are cloned, not edited.
- Assigned custom roles are archived (not hard-deleted) after staff are reassigned.

---

## 4. Canonical permission registry

Exact keys: `PERMISSION_KEYS` in `packages/domain/src/permissions.ts`.

Groups: Schedule, Booking operations, Catalogue, Reports, Administration.

`bundles.read` and `bundles.manage` were added so every current admin
bundle/package route has a named permission. They are **not** on the Front
Desk or Coach defaults.

`events.read` and `events.manage` (#319) gate `session_events`. Front Desk
receives `events.read` only. Coach receives neither. `events.manage` stays
on Super Admin until #317 Q7 says otherwise.

Sensitive keys (rates, refunds, financial dashboard/reports, staff/roles,
settings) are flagged on the registry.

---

## 5. Route and navigation mapping

Navigation, route guards, page actions, and `/api/admin/*` handlers consume
`ADMIN_NAV_ACCESS`, `ADMIN_ROUTE_ACCESS`, `ADMIN_ACTION_ACCESS`, and
`ADMIN_API_ACCESS` from `packages/domain/src/admin-access.ts`.

Mixed payloads (`GET /api/admin/dashboard`, coaches, settings, class
performance) list `includeFieldsIf`. Handlers must omit those fields unless
the actor also has the listed key. `GET /api/admin/payments?tab=refunds`
requires `refunds.read` — `payments.read` is only gcash/counter. Own-scope
rows set `requiresOwnership`; use `actorSatisfiesRequirement`.

After login or a role change, send the actor to `firstPermittedAdminRoute`
instead of a forbidden dashboard.

Unauthorized behavior:

- Unauthenticated → login with `returnTo`.
- Authenticated customer / non-staff → forbidden.
- Disabled staff → access revoked.
- Active staff lacking permission → 403 UI; API `forbidden`.
- Coach targeting another coach’s session → scoped 403 or anti-enumeration 404 (documented once by the API ticket).
- Direct API attempt → denied even if the UI button is absent.

---

## 6. Teaching capability (not a role)

A coach is an operational resource assigned to sessions.

- Coaches do not edit schedules in this epic.
- Compensation stays hidden without `coach_rates.*`.
- Public and customer surfaces never receive rates.

See `docs/backend/staff-coach-unification.md`, issue #289, and
`docs/backend/authorization-closeout.md` (#293).

---

## 7. Coach-rate privacy

Coach compensation is internal business data.

It must not be visible on:

- the public Coaches page,
- the public calendar,
- customer booking screens,
- customer booking confirmations.

Only actors with `coach_rates.read` / `coach_rates.manage` (Super Admin by
default) may see or change rates.
