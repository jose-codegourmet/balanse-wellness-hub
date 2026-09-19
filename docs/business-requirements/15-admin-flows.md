# 15 — Admin Flows

## Admin users

Initial admins:

- Coach Rex
- Coach Rex's wife

## Flow A — Create a scheduled session

1. Choose class type.
2. Set date.
3. Set start/end time.
4. Assign coach.
5. Set price per session.
6. Set capacity.
7. Publish/make bookable.

Recurring generation is not required in MVP.

## Flow B — Review GCash booking

1. Open pending payment/approval queue.
2. Open booking.
3. Review customer details.
4. Review uploaded proof.
5. Confirm or reject.
6. Record resulting status/reason.

If money was received but the booking must be rejected, manual refund handling is required.

## Flow C — Confirm Pay at Counter

1. Customer arrives.
2. Admin finds held booking.
3. Receive cash.
4. Mark payment received.
5. Confirm booking.
6. Check customer in when appropriate.

## Flow D — Handle expired reservation

1. Reservation reaches its calculated hold deadline.
2. System marks it expired.
3. Slot becomes available.
4. If waitlist exists and promotion cutoff has not passed:
   - promote next FIFO customer.

## Flow E — Handle cancellation request

1. Open cancellation request queue.
2. Review booking/payment state.
3. Decide operational outcome.
4. Complete cancellation.
5. Manually refund when applicable.
6. Record refund status.
7. Release slot.
8. Allow waitlist progression if eligible.

## Flow F — Cancel a class/session

1. Admin marks session cancelled.
2. Identify affected bookings.
3. Prevent new reservations.
4. Mark affected booking states appropriately.
5. For paid customers:
   - process refunds manually,
   - track refund pending/refunded.
6. Preserve session/booking history.

## Flow G — Handle reschedule

1. Open reschedule request.
2. Review requested destination session.
3. Check target capacity.
4. Approve/reject.
5. If approved:
   - move booking,
   - preserve history,
   - handle any later-defined price rule.

## Flow H — Check in customers

1. Open session roster.
2. Find customer.
3. Confirm booking validity.
4. Mark checked in.

After class/admin reconciliation:

- mark absent confirmed customers as no-show where appropriate.

## Flow I — Manage coach scheduling

1. Coach communicates change to Rex/admin outside the coach portal.
2. Admin edits/cancels/reassigns relevant session.
3. Admin handles affected customer bookings/refunds as needed.

Coaches do not directly edit their schedules in MVP.

## Flow — Review sales and inventory reports

1. Admin opens reporting.
2. Admin chooses a date range.
3. Optional filters may include class, coach, or session status.
4. Admin reviews:
   - gross sales,
   - refunds,
   - net sales,
   - paid/confirmed bookings,
   - coach costs,
   - class/session capacity,
   - confirmed/held/available slots,
   - waitlist totals,
   - occupancy/utilization.
5. Admin may drill into a class, coach, or session for more detail.

These reports are operational and should not be presented as a replacement for accounting software.
