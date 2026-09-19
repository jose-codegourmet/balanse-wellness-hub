# 07 — Booking Form and Waivers

## Booking form requirement

Every reservation goes through a booking form before it is finalized into the reservation/payment workflow.

## Profile reuse

The booking form should reuse known customer profile information.

A returning customer should not be forced to re-enter basic personal information for every booking.

## Identity binding

**CONFIRMED:** A customer may not book for another person.

The attendee is the authenticated account owner.

The form must not include a "guest attendee" or "book for someone else" option in MVP.

## Waivers and policies

The booking form must require the customer to explicitly accept the gym's required:

- waiver(s),
- policies,
- terms/rules relevant to participation.

These must be explicit checkboxes or equivalent affirmative consent controls.

A customer cannot proceed without completing required acceptance.

## Version tracking

The system should store enough information to establish what the customer accepted.

Recommended business record:

- document/policy identifier,
- document version,
- acceptance timestamp,
- booking/customer association.

If Coach Rex updates the policy later, old bookings should continue to show which prior version was accepted.

## Content dependency

**REQUIRED FROM COACH REX:** The actual waiver and policy documents/text.

Until those are provided, the app may support placeholder document definitions for development, but production should not invent legal content.

## Re-acceptance

OPEN:

Whether a customer must accept the waiver on:

- every booking,
- only when the policy version changes,
- or according to a defined validity period.

For the MVP implementation, the safest business behavior is to require applicable acceptance in the booking flow unless Rex explicitly chooses another rule.
