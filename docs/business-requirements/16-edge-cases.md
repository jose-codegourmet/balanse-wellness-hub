# 16 — Edge Cases

## Two people attempt the final slot

The first successfully created eligible main-list reservation receives the hold.

The second customer should see full capacity and may join the waitlist.

Do not use "first proof of payment upload" as the slot-order rule.

## Customer reserves close to class start

The effective payment hold cannot extend beyond class start.

If the booking cutoff has already passed, no new booking should be created.

## Waitlist slot opens very late

If the slot opens at or after the configured promotion cutoff, do not promote a new customer.

Default cutoff: 15 minutes before class.

## Customer selects Pay at Counter but never arrives

When the reservation hold expires:

- booking becomes expired,
- slot is released,
- waitlist may advance if still before promotion cutoff.

## GCash proof is uploaded but unclear/invalid

Admin may reject the booking.

If payment was in fact received and a refund is required, refund is manual.

## Customer submits cancellation request

Do not immediately free the slot.

The slot stays locked until admin completes the cancellation.

## Coach becomes unavailable

Admin can:

- reassign the coach if feasible, or
- cancel the session.

If the session is cancelled, paid customers enter manual refund handling.

## Customer no-shows

Mark no-show.

No refund.

## Customer tries to book for a friend

Not supported.

Each attendee must use their own account and own booking.

## Walk-in wants to skip registration

Not supported under the centralized booking model.

The customer scans the QR and creates/signs into an account.

## Policy changes after old bookings exist

Old booking acceptance must remain associated with the policy version the customer originally accepted.

New applicable bookings should use the current policy version.

## Admin needs a different hold/cutoff

Rex does not change these in the MVP admin UI.

He requests the developer to update the configuration.
