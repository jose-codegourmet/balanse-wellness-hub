# 17 — Developer-Controlled Business Configuration

## Purpose

Some operational values should be adjustable without hardcoding business behavior throughout the codebase, but should **not** be exposed to Coach Rex in the MVP admin interface.

This keeps the admin experience simple while allowing the developer to respond to real-world feedback.

## 1. Reservation hold duration

### MVP default

8 hours.

### Meaning

How long a newly created main-list reservation can hold capacity while the customer completes payment requirements.

### Effective deadline

Always capped by class start:

`min(reservation_time + HOLD_DURATION, class_start_time)`

### Admin editable?

No.

### Developer editable?

Yes.

---

## 2. New-booking / waitlist-promotion cutoff

### MVP default

15 minutes before class start.

### Meaning

Once this cutoff is reached:

- no new class reservation should be accepted,
- no waitlisted customer should be newly promoted.

### Admin editable?

No.

### Developer editable?

Yes.

---

## Suggested conceptual configuration

Implementation naming is not mandatory, but keep values centralized.

Example conceptual values:

- `BOOKING_HOLD_DURATION_HOURS = 8`
- `BOOKING_CUTOFF_MINUTES_BEFORE_START = 15`

These are business configuration, not UI constants.

## Change process

If Coach Rex later says the threshold is operationally inconvenient:

1. Rex contacts the developer.
2. Developer changes the configured value.
3. Change is deployed.
4. Existing historical bookings retain their recorded timestamps/states.

## Future

If the business stabilizes and Rex genuinely needs control, these values may later become protected admin settings.

That is not an MVP requirement.
