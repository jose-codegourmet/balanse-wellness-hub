# Venues

A venue is where a session runs: a `BRANCH` the business operates, or an `OFFSITE` partner or one-off place such as a resort for a charity event. The venue belongs to the **session**, not the event. An event shows its session's venue, so a charity event at a resort and a normal class at the studio can run at the same time.

Overlapping session times are allowed, both across venues and within one. There is no overlap check in the database or the handlers.

Shared types live in `@balanse/domain`: `VENUE_KINDS` / `VenueKind`, `AdminVenue`, `venueKindLabel`, `FIELD_CONSTRAINTS.venue`, `FIELD_CONSTRAINTS.session.venueId`, `AdminEventVenue`, and `VENUE_READ_PERMISSIONS`.

## Model

`Venue` in `packages/db/prisma/schema/catalogue.prisma`, table `venues`. The enum is `VenueKind` (`venue_kind`).

| Column | Notes |
| --- | --- |
| `name` | Required, trimmed, at most 120 characters, unique. Handlers also reject a case-insensitive duplicate. |
| `address` | Optional, at most 240 characters. Defaults to `''`. |
| `kind` | `BRANCH` (default) or `OFFSITE`. |
| `active` | Defaults to true. An inactive venue stays on existing sessions but cannot be chosen for a new or changed session. |
| `notes` | Staff-only, at most 1000 characters. Not included in the event session snapshot. |

`GymSession.venueId` is required, with FK `sessions_venueId_fkey` (`ON DELETE RESTRICT`) and index `sessions_venueId_idx`. `SessionEvent` has no venue columns.

## Rules

- `POST /api/admin/sessions` requires `venueId`. It must be an existing active venue (`404 venue_not_found`, `422 inactive_reference`).
- `PATCH /api/admin/sessions/{id}` accepts `venueId`. Keeping an inactive current venue is allowed. Switching to an inactive venue is rejected.
- Duplicating a range and weekly recurrence copy the source session's venue. Both reject an inactive source venue, the same way they reject an inactive class. The existing skip rule (same class and start time) is unchanged.
- Admin session payloads include `venue: { id, name, address, kind, active }`. Event payloads include `session.venue: { id, name, address, kind }`.
- Event create and patch reject `venueId`, `venue`, `venueName`, and `venueAddress` with `422 read_only`. Change the venue on the session.
- Public and customer payloads do not include venue data. They use explicit selects, and `toPublicSession` strips `venueId`.
- Venues cannot be deleted through the API. Set `active: false` instead.

## Routes

| Method | Path | Permission (any of) |
| --- | --- | --- |
| `GET` | `/api/admin/venues` | `VENUE_READ_PERMISSIONS`: `classes.read`, `classes.manage`, `schedule.read.all`, `schedule.read.own`, `events.read`, `events.manage` |
| `POST` | `/api/admin/venues` | `classes.manage` |
| `PATCH` | `/api/admin/venues/{id}` | `classes.manage` |

`GET` returns `{ items: AdminVenue[] }` with active venues first, then sorted by name. It accepts `active=true|false` and `kind=BRANCH|OFFSITE`. `POST` and `PATCH` return `{ venue: AdminVenue }` and write `venue.create` / `venue.update` audit rows. A duplicate name returns `409 conflict`. No new permission keys were added.

Handlers are in `packages/api/src/handlers/admin-venues.ts`. Routes are listed in `packages/db/contracts/routes.ts`, and their request bodies are in `packages/db/contracts/openapi.json`.

## RLS

RLS is enabled. There is no `anon` access. `authenticated` can select with any `VENUE_READ_PERMISSIONS` key or `is_admin()`, and can insert or update with `classes.manage` or `is_admin()`. There is no `DELETE` grant. Prisma bypasses RLS, so the dispatcher checks `ADMIN_API_ACCESS` first.

## Migration

`packages/db/prisma/migrations/20260928090000_venues_on_sessions` preserves existing data. It:

1. Creates `venue_kind` and `venues`, with check constraints for name, address, and notes length.
2. Inserts the default branch `venue-main-studio` ("Balansé Studio", with the address from `CONTACT_DETAILS.address`).
3. Creates one `OFFSITE` venue for each distinct non-blank `session_events."venueName"` (trimmed, case-insensitive, cut to 120 characters). The address comes from the most recently updated event with that name. Names that mean the studio ("Balansé/Balanse Studio", "Balansé/Balanse Wellness Hub") map to the default branch. Ids are `venue-offsite-<md5 prefix>`.
4. Adds `sessions."venueId"`, sets it from the event venue where one exists, and backfills every other session to `venue-main-studio`. It then sets `NOT NULL` and adds the FK and index.
5. Drops `session_events."venueName"` and `"venueAddress"`.

The migration is staged. Do not apply it to the shared project until the Prisma and Supabase histories are reconciled. The seed upserts `venue-main-studio` and sets it on every seeded session.
