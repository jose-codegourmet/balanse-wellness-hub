# 05 — Class and Schedule Rules

## Class vs scheduled session

A **class** describes an offering, for example:

- Yoga
- Boxing
- Capoeira

A **scheduled session** is a specific occurrence of a class, for example:

> Yoga — September 16 — 8:00 AM to 9:30 AM — Coach A — 12 slots

Bookings always attach to a scheduled session, not only to a generic class type.

## Pricing

**CONFIRMED:** Pricing is per session.

A session may last roughly one to three hours depending on the class. Duration does not change the fact that it is treated as one priced session unless the business later defines otherwise.

Each scheduled session therefore needs a price.

## Capacity

Each session has a maximum capacity.

The customer calendar should communicate availability, including remaining slots.

The system must not silently exceed configured capacity.

## Multiple sessions per customer

A customer may book multiple sessions on the same day.

Example:

- Morning yoga
- Afternoon boxing
- Evening capoeira

The system should not apply a one-booking-per-day restriction.

## Coach assignment

A session may be assigned to a coach.

MVP schedule changes are controlled by admin.

Coaches themselves do not edit the schedule.

## Recurring schedules

Recurring class schedules are needed operationally in the future, but automatic recurring schedule creation is excluded from the lean MVP.

### MVP approach

Admin creates/manages scheduled sessions manually.

### Future

Support patterns such as:

- every Monday at 8:00 AM,
- every Tuesday and Thursday at 6:00 PM,
- recurrence ranges,
- recurrence exceptions.

## Class cancellation

If a session can no longer proceed, admin may cancel it.

Affected customer bookings must remain visible as historical records and enter the appropriate cancellation/refund workflow rather than disappearing.

## Coach compensation

Each coach may have an internal default compensation rate.

Conceptual fields:

- `defaultRate`
- `rateType`

Possible rate types for planning:

- `per_session`
- `per_hour`

The actual implementation may support only the rate types Balanse uses.

Coach compensation is internal admin-only information.

## Session financial snapshot

A scheduled session should store snapshots of the financial values required for historical reporting:

- customer/session price,
- coach rate,
- coach rate type.

Historical reports must use the session snapshot rather than the coach's current profile.

Example:

- September coach rate: ₱500/session
- October coach rate changes to ₱700/session

A September session must continue reporting ₱500 as its coach cost.
