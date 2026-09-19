# 18 — Notifications and Booking Confirmation

## MVP source of truth

The customer's in-app profile/dashboard is the primary place to see booking status.

The profile should clearly separate or communicate states such as:

- pending,
- waiting for payment,
- payment submitted,
- confirmed,
- cancellation requested,
- reschedule requested,
- cancelled,
- rejected,
- expired,
- no-show.

## Confirmed booking view

A confirmed booking should expose enough information for the customer to show staff, including:

- customer identity,
- class/session,
- date/time,
- booking status,
- booking/reference identifier if used.

This is a **booking confirmation**, not necessarily an official receipt.

## Email

Resend has been considered for email delivery.

However, email is not required to make the core MVP booking flow functional.

### Recommended MVP priority

1. In-app booking state is required.
2. Email confirmation is optional/nice-to-have.
3. Do not make business correctness depend on successful email delivery.

## Future notification candidates

- booking confirmed,
- payment proof received,
- booking rejected,
- cancellation processed,
- refund processed,
- waitlist promotion,
- class cancelled,
- upcoming class reminder.

Notification design can be added once the core booking workflow is stable.
