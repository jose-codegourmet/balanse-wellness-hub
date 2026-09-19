# 12 — Rescheduling

## Confirmed principle

Customers should be able to request a reschedule online.

Rescheduling is not intended to require an informal chat/message just to begin the process.

## Admin control

The customer does not directly rewrite coach schedules or force-move a confirmed booking.

Admin handles the request and manually adjusts the booking/schedule as appropriate.

## Coach scheduling boundary

Coaches do not edit their own schedules in MVP.

If a coach needs changes, the coach contacts Coach Rex/admin, and admin performs the system change.

## Recommended MVP request flow

1. Customer opens an eligible booking.
2. Customer chooses "Request Reschedule."
3. Customer selects or indicates the desired alternative session.
4. Request enters `RESCHEDULE_REQUESTED`.
5. Current booking remains protected until admin resolves the request.
6. Admin reviews:
   - desired session,
   - available capacity,
   - coach/class constraints.
7. Admin approves or rejects.
8. If approved, the customer is moved to the new session.
9. Booking history preserves the change.

## OPEN business decisions

The following have not yet been confirmed:

- Does the target session need to be the exact same class type?
- Can a customer move to a more expensive/cheaper session?
- How are price differences handled?
- Is rescheduling allowed after check-in?
- Is there a reschedule cutoff before class?
- How many times may a booking be rescheduled?
- Does rescheduling require new waiver acceptance?
- If target session is full, may a reschedule request join its waitlist?

These should remain explicit open questions rather than being guessed by implementation.
