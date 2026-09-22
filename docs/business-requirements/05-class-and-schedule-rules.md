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

Classes are independent catalogue entries and may have an optional marketing coach roster. Every scheduled session must independently have at least one coach and may have multiple coaches; the marketing roster does not constrain these assignments. Customers reserve the class session, not an individual coach. Sessions may have a custom name; blank names fall back to the current class name. Public class pages expose only customer prices, never coach compensation.

MVP schedule changes are controlled by admin.

Coaches themselves do not edit the schedule.

## Recurring schedules

Epic #288 adds bounded admin schedule automation after the lean MVP wave. Admin can duplicate an inclusive source range or use one session as a weekly template. Generated occurrences remain ordinary sessions and follow every existing booking, capacity, cancellation, reporting, and compensation-snapshot rule.

Supported patterns:

- every Monday at 8:00 AM,
- every Tuesday and Thursday at 6:00 PM,
- inclusive recurrence ranges up to one year,
- duplicating a source range up to 63 days.

Exact class/start-time matches are skipped. Generated sessions default to draft unless admin explicitly publishes the batch. Holiday calendars, recurrence exceptions, series-wide editing/deletion, and coach self-service are not part of #288.

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
- each assigned coach’s saved rate,
- each assigned coach’s saved rate type.

Historical reports must use each assignment’s snapshot rather than the coach's current profile. Retained assignments keep their rates when a session is edited. Total session cost sums all assigned coaches, with hourly rates multiplied by the session duration.

Example:

- September coach rate: ₱500/session
- October coach rate changes to ₱700/session

A September session must continue reporting ₱500 as its coach cost.
