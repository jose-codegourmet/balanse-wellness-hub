# Admin Portal — Schedule Management

```text
SCHEDULE          [Duplicate Range] [Create Session]
[Today] [<] September 2026 [>]
ADMIN CALENDAR
Class | Coaches | Capacity | Confirmed/Held/Waitlisted

SELECTED SESSION
Class | date/time | coaches | capacity
[View Roster] [Edit] [Cancel Session]
[Make Recurring]
```

Create/Edit fields: class, date, start/end, coaches (multi-select; at least one required), price, capacity, publish/bookable state.
`Duplicate Range` copies non-cancelled sessions from an inclusive source range to a new start date. `Make Recurring` uses the selected session as a weekly template with weekday, date-range, and draft/publish controls. Both surfaces preview the generated count and explain that exact matches are skipped. Coaches do not edit schedules.

## Schedule scope

The calendar has a **Your classes** scope for staff with a linked coach
profile. Built-in Coach accounts start with **Your classes** visibly active and
see only their assigned sessions. Staff who can also read the full schedule may
switch between **All classes** and **Your classes**. Staff without a linked
coach profile keep the existing all-classes view and do not see an inapplicable
filter.

## Financial/session costing fields

When creating or editing a scheduled session, the admin should be able to see the customer-facing session price and the internal coach-rate snapshot used for reporting.

Suggested operational fields:

```text
Customer Price
Coaches (one or more)
Saved Rate per Coach (read-only)
Saved Rate Type per Coach (read-only)
Capacity
```

### Historical snapshot rule

Once a session exists, historical reporting should use the session's stored price/rate values rather than the coach's current default rate.

Changing a coach's default rate later must not rewrite existing assignment snapshots. Retained assignments preserve their saved rate; newly added active coaches receive their current default. Removing the last coach is blocked for every session status.

Class definitions do not carry coach associations. Bookings always reference the scheduled class session. Session cost sums each assignment; hourly rates are multiplied by session duration.

## Coach class change requests (#337, mock)

Coaches cannot cancel a class on their own. Cancelling, rescheduling, or swapping the coach needs Admin / Super Admin approval.

```text
SCHEDULE PANEL (assigned coach, upcoming class)
Can't make it?
[Reschedule the class] [Find a substitute] [Request cancellation]
  → /schedule/[sessionId]/change   (pending request: status + Withdraw)

/schedule/[sessionId]/change
Change: ( ) Reschedule  ( ) Find a substitute  ( ) Request cancellation
Reschedule → New date + New start time (length unchanged)
Substitute → Substitute coach (free / teaching another class at this time)
Cancel     → refund warning
Reason (10–500 chars)                         [Cancel] [Send request]

/schedule/requests  (Admin / Super Admin)
Pending | Resolved
Card: kind · status · class · requested by · Now → Proposed / coach swap · reason
[Approve] [Deny (note required)]  Who is booked →
```

- Approve applies the change: reschedule moves the session (bookings follow), substitute swaps the coach on the session and its bookings, cancel cancels the session (bookings go to manual refund handling).
- Approval permission: `schedule.cancel` for cancellations, `schedule.update` for reschedule / substitute. Nobody reviews their own request.
- One pending request per class. Only upcoming, non-cancelled classes.
- Pending requests also show in the header inbox and as a notice on the session in the schedule panel.
