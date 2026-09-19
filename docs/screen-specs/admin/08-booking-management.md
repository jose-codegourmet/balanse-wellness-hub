# Admin Portal — Booking Management

```text
BOOKINGS
[Pending] [Confirmed] [Waitlisted] [Expired] [History]
[Search Customer] [Class] [Date]
Customer | Class | Time | Payment | Status | Review
```

Booking detail actions: confirm, reject, view proof, view policy acceptance, open cancellation/reschedule request, check in, mark no-show. Important actions should be auditable.

## Reporting relationship

Booking records feed sales reporting.

Only paid/confirmed bookings should count toward gross sales under the current operational model.

Do not count:

- waitlisted users,
- unpaid held reservations.

Refunded bookings remain in history and should contribute to refund totals rather than being deleted.
