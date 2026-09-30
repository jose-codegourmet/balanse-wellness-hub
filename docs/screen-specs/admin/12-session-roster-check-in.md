# Admin Portal — Session Roster / Check-In

```text
YOGA — SEP 20 — 8:00 AM
Coach ___
9 confirmed • 2 held • 1 waitlisted

CONFIRMED
Name | Payment | Attendance | [Check In]

HELD / PENDING
WAITLIST (FIFO)
```

Actions: check in, mark no-show, inspect booking/payment, inspect waitlist order. No-show = no refund.

## Inventory / utilization metrics

The session roster can also expose operational inventory metrics:

```text
Capacity
Confirmed
Held
Available
Waitlisted
Checked In
No-show
```

Suggested utilization measures:

```text
Occupancy = Confirmed / Capacity
Attendance Utilization = Checked In / Capacity
```

Keep these as separate metrics.

## Current screen (mock, #334)

- Header: session name, date/time, coaches. Stats: **Checked in / confirmed** (emphasised), places available, held, waitlisted. A capacity bar splits checked in / confirmed-not-checked-in / held against capacity, with capacity, occupancy, attendance, and no-show counts beneath.
- Toolbar: search guests by name (all sections) and an attendance filter for the Attendance list — All, To check in, Checked in, No-show — each with a count.
- **Attendance** lists confirmed, checked-in, completed, and no-show guests (no-show guests stay visible). CONFIRMED rows: **Check in** (one tap, toast) and **No-show** (confirm dialog, no refund).
- **Held / pending**: held, payment submitted, cancellation or reschedule requested. No attendance actions.
- **Waitlist**: FIFO order with position numbers.
- Every row shows status, payment (when the actor may read payments), and a link to the booking (when the actor may read bookings). Each section has an empty state for "no guests" and "no matches".
- Mock example with attendees: `/sessions/session-wed-cutoff/roster` (Calisthenics, past cutoff) — 2 checked in, 3 to check in, 1 held paying at the counter. `/sessions/session-wed-open/roster` covers every booking status.
