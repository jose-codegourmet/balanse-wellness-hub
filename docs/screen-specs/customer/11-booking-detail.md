# Customer Portal — Booking Detail

```text
BOOKING STATUS
Class | date | time | coach | price | reference

PAYMENT
Method | payment status

INVITE FRIENDS                          (upcoming active bookings only)
Bring a friend to Reformer Pilates on Sat, Oct 4
[Share]

ACTIONS
[Request Reschedule]
[Request Cancellation]
```

Confirmed booking can be shown to staff but is not necessarily an official receipt.

## Invite friends (#343, #350)

- Shown for upcoming bookings in `CONFIRMED`, `HELD_AWAITING_PAYMENT` or `PAYMENT_SUBMITTED`. Hidden for cancelled, rejected, expired and past bookings.
- Copy: "Bring a friend to <Class> on <date>".
- **Share** opens `ShareDialog` with the public session URL, or the public event URL when the session has a published event, plus `ref=<referralCode>&src=customer`. The QR adds `via=qr`.
- No rewards. A friend who signs up within 30 days is attributed to the customer; the friend never sees the referrer's name.
