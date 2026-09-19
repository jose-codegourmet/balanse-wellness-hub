# Admin Portal — Payment Review

```text
PAYMENTS
[GCash Pending] [Pay at Counter] [Refunds]

Customer | Session | Amount | Hold Expiry
Payment proof preview
[Confirm Payment & Booking] [Reject]
```

Pay at Counter: find held booking -> receive cash -> record payment -> confirm -> optionally check in.
Refund transfer remains manual; app records refund status.

## Reporting relationship

Confirmed paid bookings should become eligible for sales reporting.

Completed manual refunds should be reflected in refund totals and net-sales calculations.

Keep payment state and booking state distinct enough to preserve accurate history.
