# 22 — Inventory and Sales Reporting

## Purpose

Balanse needs basic internal operational reporting so Coach Rex can understand:

- how much the business is selling,
- how much it is paying coaches,
- which classes generate revenue,
- how much class capacity is being used,
- where refunds and no-shows affect operations.

This is operational reporting for the booking system. It is not intended to replace formal accounting software.

## 1. Coach Rate Model

Each coach may have an internal default compensation rate.

Conceptual fields:

```text
defaultRate
rateType
```

Possible rate types:

- `per_session`
- `per_hour`

The implementation may support only the rate types Balanse actually uses.

### Privacy rule

Coach rates are internal business information.

They must not be shown on:

- the public Coaches page,
- the public calendar,
- customer booking details,
- customer booking confirmations.

Only authorized admin users should see coach-rate information.

## 2. Session Financial Snapshot

A scheduled session must preserve the historical values used for reporting.

At minimum:

```text
Session
- customerPrice
- coachRate
- coachRateType
```

Historical reports must use these session-level values instead of the coach's current rate.

Example:

```text
September 1
Coach default rate = ₱500/session

October 1
Coach default rate changes to ₱700/session
```

The September session must continue reporting a coach cost of ₱500.

## 3. Sales Reporting

Useful measures:

- gross sales,
- refunds,
- net sales,
- paid/confirmed bookings,
- sales by class,
- sales by coach/session,
- sales by day/week/month.

Suggested operational definitions:

```text
Gross Sales
= value of paid/confirmed bookings included in the report

Refunds
= value of completed refunds

Net Sales
= Gross Sales - Refunds
```

Exact accounting recognition rules can later be refined.

## 4. Coach Cost Reporting

Useful views:

- coach cost by coach,
- coach cost by date range,
- coach cost by class,
- coach cost by session.

Coach cost must use the session snapshot.

## 5. Session Contribution

A useful operational calculation is:

```text
Gross Session Revenue
- Coach Cost
= Gross Contribution
```

Example:

```text
Boxing — Sep 19 — 5:00 PM

10 paid attendees × ₱600
Gross Revenue        ₱6,000

Coach Cost            ₱700
────────────────────────────
Gross Contribution   ₱5,300
```

Do not call this "profit" unless rent, utilities, taxes, staff overhead, equipment, fees, and other relevant costs are included.

## 6. Capacity as Inventory

For Balanse, class capacity is the primary sellable inventory.

A scheduled session may report:

```text
Capacity
Confirmed
Held
Available
Waitlisted
Checked In
No-show
Occupancy Rate
```

Example:

```text
Yoga — Sep 20 — 8:00 AM

Capacity       12
Confirmed       8
Held            2
Available       2
Waitlisted      3
```

### Occupancy

Operational occupancy may use:

```text
confirmed / capacity
```

Attendance utilization may use:

```text
checked_in / capacity
```

These should remain separate measures.

## 7. Suggested Admin Reports

### Sales overview

- Gross sales
- Refunds
- Net sales
- Paid bookings

### Class performance

- sessions held,
- gross sales,
- confirmed bookings,
- average occupancy,
- no-shows.

### Coach report

- sessions assigned,
- coach cost,
- customer revenue from assigned sessions,
- attendance/capacity utilization.

### Session report

- customer price,
- capacity,
- confirmed,
- held,
- waitlisted,
- checked-in,
- no-show,
- gross revenue,
- refunds,
- coach cost,
- gross contribution.

## 8. Filtering

At minimum:

- date range.

Useful optional filters:

- class,
- coach,
- session status.

## 9. Data Integrity Rules

Do not:

- infer old coach costs from the current coach rate,
- count waitlisted customers as sales,
- count unpaid held reservations as revenue,
- delete refunded bookings from history,
- overwrite old customer prices when pricing changes.

## 10. MVP Boundary

Included:

- basic sales totals,
- refund/net-sales visibility,
- coach-cost totals,
- class/session capacity utilization,
- simple reporting filters.

Not required:

- full accounting ledger,
- tax reporting,
- payroll,
- formal P&L,
- balance sheet,
- physical inventory costing,
- forecasting,
- accounting-system integration.
