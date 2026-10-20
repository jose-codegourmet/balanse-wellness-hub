# Change: Session price floor and lock

## Why

The session editor accepted ₱0 as a price per person, and the price could be rewritten after customers had already paid for the session. Payment review, receipts and reports read the session price, so a late change silently disagreed with what customers paid.

## What

- `FIELD_CONSTRAINTS.session.customerPrice.min` and `FIELD_CONSTRAINTS.class.defaultCustomerPrice.min` are `1`. The session form (`pricePhp`) and `POST`/`PATCH /api/admin/sessions` reject anything below ₱1 (`out_of_range`); class `defaultPricePhp` has the same floor. No DB check constraint change (the existing one is nonnegative).
- `PAID_BOOKING_STATUSES` / `bookingHasPaid` / `sessionPriceLocked` in `@balanse/domain` define "a customer already paid": `PAYMENT_SUBMITTED`, `CONFIRMED`, `CANCELLATION_REQUESTED`, `RESCHEDULE_REQUESTED`, `CHECKED_IN`, `COMPLETED`, `NO_SHOW`. Status alone decides, because the roster hides payment status from staff without `payments.read`.
- `PATCH /api/admin/sessions/{id}` with a `customerPrice` different from the saved one returns 422 `price_locked` on `customerPrice` when any such booking exists. Resending the saved price is accepted, so other edits still work.
- The session editor derives the lock from the roster it already loads, disables "Price per person" with "Locked: N customers have already paid at this price.", hides "Reset to class default", and stops class changes from overwriting a locked price. The api-client maps a `customerPrice` field error back to `pricePhp` so the message lands on the field.
- The Storybook memory adapter mirrors the lock; new stories `PriceLockedAfterPayment` and `PriceEditableNoPayments`.

## Decisions (Jose, 2026-10-20)

- Minimum price is ₱1; ₱0 is never valid for a session or a class default.
- A paid or payment-submitted booking locks the price; unpaid holds and waitlist do not.

## Out of scope

Per-booking price snapshots (the booking still reads the session price), and a database trigger for the lock (API-enforced, like the started-session event guard).

## Validation

- `pnpm lint`, `pnpm typecheck`, `pnpm build-storybook`
- Manual: edit `session-wed-open` in Storybook → price disabled with the paid count; edit `session-thu-early` → price editable, ₱0 rejected on submit.
