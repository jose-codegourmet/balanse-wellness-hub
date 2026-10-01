# Delta: Events

Base: `openspec/specs/events.md`. Merge on archive. Amends #317 Q1 ("no public event page").

## MODIFIED Requirements

7. `/events` and `/events/[eventId]` in `apps/admin` are the staff read surface. Create and edit use one React Hook Form at `/schedule/[sessionId]/event` (session pre-bound) and `/events/new` (picker). Schema and defaults sit with that form. Writes use `getMockAdapter()` through the admin query layer and `events.manage`. Publishing is blocked while the session is `DRAFT`. Cancel and archive confirm that the session and its bookings stay in place. Screens do not call `/api/*`. **Changed:** event detail adds **Share event** and **Open public page** (see requirement 10).

## ADDED Requirements

9. Events have a public page in `apps/web` at `/events/<event-title-slug>/<YYYY-MM-DD>/<eventId>`. The date is the session start date in `Asia/Manila`. The slug is derived from `title` at render time (`slugify`); no slug column is stored. The id is authoritative: a stale slug (title renamed) or date (session moved) returns a 301 to the canonical path with the query string kept.
10. Public visibility follows event status: `DRAFT` and `ARCHIVED` → 404; `PUBLISHED` renders; `CANCELLED`, or a cancelled session, renders with a "This event was cancelled" banner and no booking button. Past events show "This event has ended" and, when a beneficiary is set, "Thank you for supporting <beneficiary>". The public payload never carries `internalNotes` or `isPlaceholder`, and never renders venue `notes`.
11. The event registration window gates the public booking button: before `registrationOpensAt` → disabled "Registration opens <Day, Mon D, h:mm A>"; after `registrationClosesAt` → disabled "Registration closed". Inside the window, or with no window, session booking rules apply. The canonical booking cutoff always applies on top.
12. The public session page for a session with a published or cancelled event links to the event page ("Part of <event title>"). The event page reuses the session page's facts, coaches and "Who's going" block. Bookings stay on the session.
13. Admin share: event detail builds the public URL with `src=studio`. `DRAFT` → "Publish the event to share it"; `ARCHIVED` → "Archived events can't be shared"; cancelled → link and QR allowed, poster hidden. No new permission; anyone who can open event detail can share.
14. Mock phase: the public page reads `getPublicEventPage(eventId)` (null for `DRAFT` / `ARCHIVED`; effective `CANCELLED` when the session is cancelled) and `getPublicRoster`. Database read: `app_public.public_event` (#345). No public `/events` index in this change.

## Routes

- **Added:** `/events/[eventSlug]/[date]/[eventId]` (`apps/web`, public), `/share/poster/events/[eventId]` (`apps/web`, image)
- HTTP (documented, not implemented): `GET /api/public/events/{id}`, `GET /api/public/sessions/{id}/roster`
