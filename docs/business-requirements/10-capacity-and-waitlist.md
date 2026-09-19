# 10 — Capacity and Waitlist

## Capacity principle

A scheduled session has a maximum number of active main-list slots.

Temporary reservation holds consume capacity.

## First-come, first-served

When several customers want the last available slot, ordering is based on who successfully creates the eligible reservation first.

This is a system-ordering rule, not "first person to upload payment proof."

Once a main-list hold exists, that customer receives the configured payment grace period.

## Waitlist

When the main session capacity is full:

- eligible customers may join a waitlist,
- waitlist order is FIFO,
- joining the waitlist does not require payment,
- waitlisted customers do not consume a normal class slot.

## Slot release

A slot may be released because:

- reservation expires without payment,
- admin rejects a reservation,
- admin completes a cancellation and releases the slot,
- another business-approved event frees capacity.

## Automatic waitlist promotion

When an eligible slot becomes free, the next waitlisted customer should be promoted according to FIFO order, provided the new-booking/promotion cutoff has not been reached.

## Grace period after promotion

A promoted customer receives the normal reservation grace-period calculation from the promotion time.

Default principle:

`promotion_hold_expires_at = min(promoted_at + configured_hold_duration, class_start_at)`

However, no promotion should occur once the configured waitlist/new-booking cutoff is reached.

## Default promotion cutoff

MVP default:

- 15 minutes before class start.

At or after the cutoff:

- do not promote a new waitlisted customer into the class,
- do not create new bookings for that class.

This cutoff is developer-configurable.

## Cancellation request does not immediately free capacity

If a customer submits a cancellation request:

- the booking remains pending admin handling,
- the slot remains locked,
- waitlist should not advance merely because a cancellation was requested.

The slot becomes available only after admin completes the cancellation/release action.

## Admin authority

Rex/admin remains the final operational authority.

If a rare exception requires rejecting a reservation, the system should support that action with a reason/history rather than corrupting FIFO ordering silently.
