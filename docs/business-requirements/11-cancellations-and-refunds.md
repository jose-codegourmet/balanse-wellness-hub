# 11 — Cancellations and Refunds

## Customer cancellation

A customer does not instantly cancel a paid/confirmed booking.

Instead:

1. Customer opens the booking.
2. Customer submits a cancellation request.
3. Booking enters `CANCELLATION_REQUESTED`.
4. The slot remains locked.
5. Admin reviews/handles the request.
6. Admin completes the cancellation.
7. If refund is applicable, admin sends the refund manually.
8. Admin records the result.

## Why cancellation is a request

The expected case is that a customer may already have paid.

Balanse does not want the customer-side app to automatically release the booking or imply that money has already been refunded.

## Refund method

**CONFIRMED:** Refund only.

No credit alternative is needed for MVP.

## Refund execution

Refund is manual.

The software should track state but does not transfer the money.

## Gym/admin cancellation

Example:

- coach becomes unavailable,
- session must be cancelled.

Admin cancels the session/affected bookings.

If customers already paid:

- refunds are still manually performed,
- the app should indicate refund pending/refunded status.

## No-show

**CONFIRMED:** No-show does not receive a refund.

## Cancellation policy timing

OPEN:

The project has not yet defined a customer cancellation deadline or eligibility rule such as:

- cancel anytime before class,
- must cancel 12/24 hours before,
- refund only before a cutoff.

Until Rex defines this, do not invent a strict refund eligibility policy.

The workflow can exist while eligibility remains an admin decision.
