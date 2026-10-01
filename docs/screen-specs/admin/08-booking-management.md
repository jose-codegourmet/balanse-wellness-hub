# Admin Portal — Booking Management

```text
BOOKINGS
[Pending] [Confirmed] [Waitlisted] [Expired] [History]
[Search Customer or Reference] [Class] [Date]
Customer | Reference | Class | Time | Payment | Status | Review
```

Booking detail actions: confirm, reject, view proof, view policy acceptance, open cancellation/reschedule request, check in, mark no-show. Important actions should be auditable.

Booking status tabs update `?tab=`. Direct links such as `/bookings?tab=confirmed` open the matching view; a missing or unknown tab falls back to Pending.

Show the same plain-text `BWH-…` booking reference used by the customer on list rows and detail, and include it in staff search.

## Reporting relationship

Booking records feed sales reporting.

Only paid/confirmed bookings should count toward gross sales under the current operational model.

Do not count:

- waitlisted users,
- unpaid held reservations.

Refunded bookings remain in history and should contribute to refund totals rather than being deleted.

## Cancelled booking detail

A cancelled booking is a closed record, not an active booking detail. Lead with
the cancellation state, customer, session, payment state, and any stored
cancellation note. When the viewer has refund access, show the refund state and
amount; a pending refund may be marked complete through the existing mock
recording action. Do not show check-in, reschedule, confirm, or reject actions.
