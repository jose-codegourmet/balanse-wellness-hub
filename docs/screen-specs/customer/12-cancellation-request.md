# Customer Portal — Cancellation Request

```text
REQUEST A CANCELLATION
Current booking summary

WHAT HAPPENS NEXT
- The studio reviews the request; it does not cancel the booking immediately.
- The slot stays held until the studio completes the cancellation.
- Any applicable refund is handled separately and manually.

Reason (optional unless later required)
[Back to booking] [Submit cancellation request]
```

When the session has `cancellable = false` (#380) the route renders a notice (“Bookings on this session cannot be cancelled by request…”) with Back to booking instead of the form; the API answers `409 booking_not_cancellable` to a direct call.

The page uses the same booking-summary treatment as the confirmed booking view.
The customer can return to their booking without submitting. Request submission is mock-only;
it records the request and returns to booking detail. A request does not immediately free the slot.
