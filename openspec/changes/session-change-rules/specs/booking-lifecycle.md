# Delta: Booking lifecycle

Base: `openspec/specs/booking-lifecycle.md` (requirements 1–9). Already merged into the base on 2026-10-20; kept here as the change history.

## MODIFIED Requirements

6. Customer cancellation and reschedule remain requests resolved by staff. **A session whose `cancellable` or `reschedulable` switch is off refuses that request: `POST /api/bookings/{id}/cancellation-request` → `409 booking_not_cancellable`, `POST /api/bookings/{id}/reschedule-request` → `409 booking_not_reschedulable`. The origin session decides a reschedule; a target session's switch never blocks it from being chosen.** No cancellation deadline, automatic refund eligibility or reschedule price-difference rule is invented.

## ADDED Scenarios

- **Final session:** Given a published session with both switches off, when a customer opens its public page they see “No cancellations” and “No reschedules”; the booking form requires the acknowledgement before reserving; and both request routes answer 409 for a booking on it.
- **Existing sessions:** Given sessions created before this change, both switches read as on and nothing changes for their bookings.
