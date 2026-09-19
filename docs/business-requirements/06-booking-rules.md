# 06 — Booking Rules

## Canonical booking rule

A reservation is created for:

> one authenticated customer + one scheduled session

## Eligibility

A customer may reserve only when:

- authenticated,
- the session is accepting new bookings,
- the booking cutoff has not been reached,
- the customer completes required booking form items,
- the customer accepts required waivers/policies,
- either a slot is available or the customer is eligible to join the waitlist.

## Own booking only

Customers cannot reserve for another person.

The authenticated customer is the attendee.

## Multiple bookings

Customers may reserve more than one class/session, including multiple sessions on the same calendar day.

## First-come, first-served

When capacity is limited, ordering is based on reservation/waitlist order.

The default principle is **first come, first served**.

Admin retains final confirmation authority for operational exceptions.

## Reservation hold

A main-list reservation temporarily consumes a slot while the customer completes the required payment path.

Default hold duration:

- 8 hours

But the hold cannot extend beyond the session start time.

Conceptually:

`hold_expires_at = min(reserved_at + hold_duration, class_start_at)`

The hold duration is developer-configurable.

## Booking cutoff

New students should not be accepted too close to class start.

MVP default:

- stop accepting new bookings/waitlist promotions 15 minutes before class.

This threshold is developer-configurable.

The cutoff is separate from the payment grace period.

Example:

- A customer already holding a valid reservation may still complete Pay at Counter before the class starts, subject to the reservation's existing expiration.
- A brand-new booking should not be created after the configured booking cutoff.

## Admin confirmation

Payment or payment evidence does not automatically grant final confirmation.

Admin confirms or rejects according to the MVP manual process.

## Booking records are never silently removed

Expired, rejected, cancelled, no-show, and completed bookings should remain part of booking history.
