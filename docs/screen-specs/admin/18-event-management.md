# Admin — Event management

An event is a `1:0..1` wrapper on one scheduled session. The session stays the bookable unit: capacity, cutoff, manual payment, cancellation, reschedule, roster, and reporting do not change. Price, capacity, date, and time are read from the session and edited on the session form.

List and detail are the read surface. Create and edit share one form.

## Routes

- `/events` — upcoming-first index (title, linked session, venue, price, capacity vs booked, event state). Filter by state and date. Search by title. Scope by session.
- `/events/[eventId]` — event content, linked session summary, link to `/sessions/[sessionId]/roster` (no second attendee list), status history, and a link to the authoring form when the actor has `events.manage`. Header actions **Share event** and **Open public page** (see Public page).
- `/events/new` — create, starting with a session picker. A cancelled session and a session that already has an event are blocked in the picker, with the reason. A taken session links to the existing event.
- `/schedule/[sessionId]/event` — create/edit nested under the session, same placement as recurrence. The session is pre-bound and read-only. An existing event opens the same form prefilled. A cancelled session with no event is blocked.

Sidebar: Events, in Operations, immediately after Schedule. The nested authoring route highlights Schedule. The index and detail highlight Events.

## Fields

Title, summary, description, poster, gallery, beneficiary, what to bring, internal notes, optional registration open/close. Status `DRAFT` | `PUBLISHED` | `CANCELLED` | `ARCHIVED`.

Session class, venue, start, end, capacity, and customer price are read-only on the event. The venue shown is the session's venue (branch or off-site); change it on the session. Fixture prices are non-authoritative placeholders (**OQ-PRICE**), including Pilates for a Cause at ₱1,000.

## Rules

- One event per session. A session with no event is a valid state.
- Publishing is blocked while the session is `DRAFT`, with the shared conflict copy and a path to publish the session.
- Cancelling or archiving an event does not cancel the session or its bookings. Session cancellation is the existing schedule flow.
- Cancelling the session marks a draft or published event cancelled. An archived event stays archived.
- Customers do not create events. Published and cancelled events have a public page (below).
- Mock-only. `getMockAdapter()` (`getAdminEvents`, `getAdminEvent`, `getAdminEventForSession`, `createAdminEvent`, `updateAdminEvent`, `publishAdminEvent`, `cancelAdminEvent`, `archiveAdminEvent`). No `/api/*` from screens.

## Public page (#343)

This amends #317 Q1. Each event has a public page in `apps/web` at `/events/<event-title-slug>/<YYYY-MM-DD>/<eventId>` (`docs/screen-specs/public/13-event-page.md`). The slug is derived from the title at render time and never stored; renaming the title or moving the session 301s old links to the new canonical URL. `DRAFT` and `ARCHIVED` return 404. Cancelled events render with a banner. `internalNotes` is never public.

**Share event** opens `ShareDialog` with the public URL built from `NEXT_PUBLIC_WEB_SITE_URL` + `src=studio` (QR adds `via=qr`) and the poster `/share/poster/events/[eventId]?src=studio`. Disabled reasons: `DRAFT` → "Publish the event to share it"; `ARCHIVED` → "Archived events can't be shared". Cancelled → link and QR allowed, poster hidden. Anyone who can open event detail can share; no new permission.

## Permissions

`events.read` and `events.manage` from the staff permission registry. Super Admin has both. Front Desk has read. Coach has neither.

## Empty and confirmation copy

- Empty list: `admin.no-events`
- Missing detail: `admin.event-not-found`
- Save, publish, publish-blocked, cancel, and archive use `event.*` toast copy. Publish-blocked repeats “Publish the session before publishing this event.”
