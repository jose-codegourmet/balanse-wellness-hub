# Admin Portal — Staff Management

```text
STAFF MANAGEMENT                    [Add Staff]
Name | Role | Status | Action
Rex  | Admin| Active | View/Edit

STAFF DETAIL
Name
Email
Role
Status
[Save] [Disable Access]
```

No public admin registration.

## Financial access note

Staff roles should be designed so only authorized admin users can access:

- coach compensation rates,
- sales reports,
- refund totals,
- coach-cost reports,
- capacity/utilization reporting.

Coach compensation must remain internal.

## Coach capability (BE-055 / FE-ADM-038)

A staff member may optionally be linked to a `Coach` teaching profile. “Is a coach” is derived from that link (`isCoach` / `coachId`) — it is **not** a `StaffRole` value. `StaffRole` stays Admin-only.

Disabling staff access while a linked coach has future sessions deactivates the **coach** (`active = false`) and leaves assigned sessions untouched. Unlinking must never delete the coach row.
See `docs/backend/staff-coach-unification.md`.
