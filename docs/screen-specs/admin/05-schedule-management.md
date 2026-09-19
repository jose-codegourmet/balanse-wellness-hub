# Admin Portal — Schedule Management

```text
SCHEDULE                           [Create Session]
[Today] [<] September 2026 [>]
ADMIN CALENDAR
Class | Coach | Capacity | Confirmed/Held/Waitlisted

SELECTED SESSION
Class | date/time | coach | capacity
[View Roster] [Edit] [Cancel Session]
```

Create/Edit fields: class, date, start/end, coach, price, capacity, publish/bookable state.
Recurring generation is out of MVP. Coaches do not edit schedules.

## Financial/session costing fields

When creating or editing a scheduled session, the admin should be able to see the customer-facing session price and the internal coach-rate snapshot used for reporting.

Suggested operational fields:

```text
Customer Price
Coach
Coach Rate
Coach Rate Type
Capacity
```

### Historical snapshot rule

Once a session exists, historical reporting should use the session's stored price/rate values rather than the coach's current default rate.

Changing a coach's default rate later must not rewrite old sessions.
