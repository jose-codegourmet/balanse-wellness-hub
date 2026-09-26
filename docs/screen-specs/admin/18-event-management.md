# Admin — Event management

An event is a `1:0..1` wrapper on one scheduled session. The session stays the bookable unit: capacity, cutoff, manual payment, cancellation, reschedule, roster, and reporting do not change. Price, capacity, date, and time are read from the session and edited on the session form.

Screens for this spec are not built here. Routes are reserved so list, detail, and the authoring form share one contract.

## Routes

- `/events` — upcoming-first index (title, linked session, venue, price, capacity vs booked, event state). Filter by state and date. Search by title. Scope by session.
- `/events/[eventId]` — event content, linked session summary, link to `/sessions/[sessionId]/roster` (no second attendee list), status history.
- `/schedule/[sessionId]/event` — create/edit nested under the session, same placement as recurrence. Blocks a session that already has an event, and says why.

Sidebar: Events, in Operations, immediately after Schedule. The nested authoring route highlights Schedule. The index and detail highlight Events.

## Fields

Title, summary, description, poster, gallery, venue name, venue address, beneficiary, what to bring, internal notes, optional registration open/close. Status `DRAFT` | `PUBLISHED` | `CANCELLED` | `ARCHIVED`.

Session class, start, end, capacity, and customer price are read-only on the event. Fixture prices are non-authoritative placeholders (**OQ-PRICE**), including Pilates for a Cause at ₱1,000.

## Rules

- One event per session. A session with no event is a valid state.
- Publishing is blocked while the session is `DRAFT`, with the shared conflict copy and a path to publish the session.
- Cancelling or archiving an event does not cancel the session or its bookings. Session cancellation is the existing schedule flow.
- Cancelling the session marks a draft or published event cancelled. An archived event stays archived.
- Customers do not create events. There is no public event page in this spec.
- Mock-only. `getMockAdapter()` (`getAdminEvents`, `getAdminEvent`, `getAdminEventForSession`, `createAdminEvent`, `updateAdminEvent`, `publishAdminEvent`, `cancelAdminEvent`, `archiveAdminEvent`). No `/api/*` from screens.

## Permissions

`events.read` and `events.manage` from the staff permission registry. Super Admin has both. Front Desk has read. Coach has neither.

## Empty and confirmation copy

- Empty list: `admin.no-events`
- Missing detail: `admin.event-not-found`
- Save, publish, publish-blocked, cancel, and archive use `event.*` toast copy. Publish-blocked repeats “Publish the session before publishing this event.”
