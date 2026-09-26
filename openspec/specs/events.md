# Spec: Events

## Requirements

1. An event is a `1:0..1` `SessionEvent` wrapper on one `GymSession`. The session is the bookable unit. Capacity, booking cutoff, manual payment, cancellation, reschedule, roster, and reporting rules apply unchanged. The event does not copy price, capacity, date, time, or coach assignments.
2. Admin lists and opens events at `/events` and `/events/[eventId]`. Authoring is nested at `/schedule/[sessionId]/event`, the same way recurrence nests under a session. A session that already has an event cannot take a second one.
3. Event status is `DRAFT` | `PUBLISHED` | `CANCELLED` | `ARCHIVED`, separate from session status. An event cannot be published while its session is `DRAFT` (or otherwise unpublished). Cancelling the session surfaces a still-live event as cancelled. Archiving an event never touches the session or its bookings. Cancelling an event does not cancel the session or its bookings.
4. Event content is title, summary, description, poster, gallery, off-site venue, beneficiary, what to bring, internal notes, and an optional registration window. That window does not replace the canonical booking cutoff. Session date, time, capacity, and price are edited on the session form.
5. Staff permissions are the #289 registry keys `events.read` and `events.manage`. Super Admin has both. Front Desk has `events.read`. Coach has neither. Hiding the nav item is not authorization.
6. UI reads and writes through `MockDataAdapter` during the mock phase. Screens do not call `/api/*`. Backend schema and HTTP contracts are implemented independently. Fixture session prices are non-authoritative placeholders (**OQ-PRICE**), including the Pilates for a Cause ₱1,000 figure.
7. List, detail, and form screens are follow-up work. This capability reserves the routes, nav entry, permission keys, status and toast copy, and mock methods those screens consume.

## Routes

- `/events`
- `/events/[eventId]`
- `/schedule/[sessionId]/event`
- HTTP (implemented, not wired): `GET|POST /api/admin/events`, `GET|PATCH /api/admin/events/{id}`, `POST /api/admin/events/{id}/publish|cancel|archive`
