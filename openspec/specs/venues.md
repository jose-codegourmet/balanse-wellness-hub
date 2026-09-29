# Spec: Venues

## Requirements

1. A venue is where a session runs: a `BRANCH` (a studio the business runs) or an `OFFSITE` place (a partner or one-off location such as a resort). Fields: name (unique, required), address, kind, staff notes, active.
2. Every session has exactly one venue (`AdminSession.venueId`, required). New sessions default to the first active branch. Only active venues can be picked; a session may keep a venue that was later deactivated.
3. Sessions may overlap in time, across venues and within the same venue. How a space is shared is the studio's call, so the product never blocks or warns about venue overlap. Only a coach booked into two overlapping sessions is flagged, as a non-blocking warning.
4. Events do not store a venue. Admin event payloads expose the session's venue as `session.venue` (`id`, `name`, `address`, `kind`). `venueId` is not part of public or customer session payloads yet.
5. Admin manages venues at `/venues` (Directory nav). Reading needs any of `classes.read`, `classes.manage`, `schedule.read.all`, `schedule.read.own`, `events.read`, `events.manage` (`VENUE_READ_PERMISSIONS`); the `/venues` screen itself follows `classes.read`. Create and edit need `classes.manage` (action `venues-manage`). Venues are deactivated, never deleted.
6. The schedule shows a venue on calendar chips for off-site sessions (and for every session once there is more than one active branch), and the selected-session panel always shows it.
7. Screens use `getMockAdapter()` (`getAdminVenues`, `upsertAdminVenue`) through the admin query layer. Backend model, migration, RLS, and HTTP contracts: `docs/backend/venues.md`.

## Routes

- `/venues`
- HTTP (implemented, not wired): `GET|POST /api/admin/venues`, `PATCH /api/admin/venues/{id}`
