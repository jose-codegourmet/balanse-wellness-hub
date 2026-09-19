# Admin Portal — Sales & Inventory Reports

## Purpose

Give Coach Rex and authorized admins a simple operational view of:

- sales,
- refunds,
- net sales,
- coach costs,
- class/session performance,
- class-capacity utilization.

This is operational reporting, not a full accounting system.

## Rough layout

```text
┌────────────────────────────────────────────────────────────┐
│ REPORTS                                                     │
│ [Date Range] [Class] [Coach] [Session Status]              │
├────────────────────────────────────────────────────────────┤
│ SALES OVERVIEW                                              │
│ [Gross Sales] [Refunds] [Net Sales] [Paid Bookings]        │
├────────────────────────────────────────────────────────────┤
│ CLASS PERFORMANCE                                           │
│ Class      Sessions   Revenue   Occupancy   No-shows        │
│ Yoga       ...        ...       ...         ...             │
│ Boxing     ...        ...       ...         ...             │
├────────────────────────────────────────────────────────────┤
│ COACH COSTS                                                 │
│ Coach      Sessions   Coach Cost   Related Revenue          │
│ Rex        ...        ...          ...                      │
├────────────────────────────────────────────────────────────┤
│ SESSION PERFORMANCE                                         │
│ Date/Time | Class | Capacity | Confirmed | Revenue | Cost   │
│ ...                                                         │
└────────────────────────────────────────────────────────────┘
```

## Session detail drill-down

```text
Boxing — Sep 19 — 5:00 PM

Capacity              12
Confirmed             10
Held                   1
Available              1
Waitlisted             2
Checked In             9
No-show                1

Customer Price       ₱600
Gross Revenue      ₱6,000
Refunds                ₱0
Coach Cost            ₱700
Gross Contribution  ₱5,300
```

## Important terminology

Use:

- Gross Sales
- Refunds
- Net Sales
- Coach Cost
- Gross Contribution
- Occupancy
- Attendance Utilization

Avoid calling gross contribution "profit" unless all operating expenses are included.

## Data integrity rules

Do not:

- count waitlisted customers as sales,
- count unpaid held reservations as revenue,
- recalculate old coach costs from a coach's current rate,
- erase refunded bookings,
- overwrite historical prices when defaults change.

## Financial privacy

Coach compensation and coach-cost data are admin-only.
