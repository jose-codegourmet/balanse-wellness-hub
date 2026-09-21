# Admin Portal — Schedule Management

```text
SCHEDULE                           [Create Session]
[Today] [<] September 2026 [>]
ADMIN CALENDAR
Class | Coaches | Capacity | Confirmed/Held/Waitlisted

SELECTED SESSION
Class | date/time | coaches | capacity
[View Roster] [Edit] [Cancel Session]
```

Create/Edit fields: class, date, start/end, coaches (multi-select; at least one required), price, capacity, publish/bookable state.
Recurring generation is out of MVP. Coaches do not edit schedules.

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
