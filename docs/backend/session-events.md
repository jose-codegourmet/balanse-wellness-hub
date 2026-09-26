# Session events (#319)

An event is a `1:0..1` operational wrapper on one existing `GymSession`. The session keeps `startsAt` / `endsAt`, `capacity`, `customerPrice`, `status`, and coach staffing (`SessionCoach`). The event stores presentation and logistics only.

HTTP contracts are #320, documented in [api-routes.md](./api-routes.md). Screens do not call them. Do not backfill existing sessions into events.

## Model

`SessionEvent` in `packages/db/prisma/schema/events.prisma`, table `session_events`.

| Column | Notes |
| --- | --- |
| `sessionId` | Unique FK to `sessions.id`, `ON DELETE RESTRICT`. Deleting an event does not delete the session, bookings, or history. |
| `title`, `summary`, `description` | Copy. Title is required and non-blank. |
| `posterImage`, `galleryImages` | Object keys. Same signed-upload pattern as `GymClass.heroImage` (BE-052). Gallery length is at most 12. No new upload mechanism. |
| `venueName`, `venueAddress` | Off-site venue. Not the studio address. |
| `beneficiary`, `whatToBring`, `internalNotes` | Descriptive. `internalNotes` is staff-only because the whole table is staff-gated. |
| `registrationOpensAt`, `registrationClosesAt` | Optional `timestamptz` window. When both are set, close is on or after open. This does not replace the canonical booking cutoff. |
| `status` | `event_status`: `DRAFT`, `PUBLISHED`, `CANCELLED`, `ARCHIVED`. Default `DRAFT`. |
| `isPlaceholder` | Seed flag, default false. |

There is no `slug`. Add one only if a public event surface is approved (#317 Q1).

There are no price or capacity columns. Reporting stays on the session (`22-inventory-and-sales-reporting.md`).

`GymSession.classId` stays required.

Indexes: unique `sessionId` (also the join for upcoming-first lists via `sessions.startsAt`), `status`, and `createdAt` for list ordering.

## Database invariants

Enforced by `app_private.assert_session_event_invariants` (`BEFORE INSERT OR UPDATE`):

- One event per session: unique `sessionId`.
- Insert, or a change of `sessionId`, fails with `event_on_cancelled_session` when the session status is `CANCELLED`.
- Setting status to `PUBLISHED` fails with `event_publish_requires_published_session` unless the session status is `PUBLISHED` (blocks publish over `DRAFT` and over `CANCELLED`).

Cancelling a session does not rewrite the event inside this trigger. `POST /api/admin/sessions/{id}/cancel` (#320) sets a `DRAFT` or `PUBLISHED` event to `CANCELLED` in the same transaction, with one `event.status` audit row. Archived and already-cancelled events stay as they are, so a retry does not add another audit row.

## Audit

`app_private.audit_session_event_status` writes **exactly one** `audit_events` row:

| When | `action` | `beforeStatus` | `afterStatus` |
| --- | --- | --- | --- |
| Insert | `event.create` | null | new status |
| Status change | `event.status` | previous status | new status |

`entityType` is `session_event`. Metadata includes `sessionId`. Content edits do not write a row.

Actor resolution, in order:

1. Transaction-local `app.actor_staff_id` when it matches a `staff_members.id` (`actorType = STAFF`).
2. Active non-system staff for `auth.uid()`.
3. Otherwise `SYSTEM` and `app_private.system_staff_id()`.

Handlers must not insert a second audit row for the same transition. Set the actor before the write:

```sql
SELECT set_config('app.actor_staff_id', '<staff id>', true);
```

## RLS

No grants to `anon`. `authenticated` select requires `events.read`, `events.manage`, or `is_admin()`. Writes require `events.manage` or `is_admin()`.

The #298 trigger `staff_role_permissions_builtin_guard` locks Front Desk and Coach matrices. The migration disables that trigger only for the seed insert, then re-enables it.

Seeded keys (category `schedule`):

| Key | Built-in grant |
| --- | --- |
| `events.read` | Super Admin snapshot, Front Desk |
| `events.manage` | Super Admin snapshot only |

Coach receives neither key. Super Admin `allAccess` still grants both through `app_private.has_permission`.

## Migration

`packages/db/prisma/migrations/20260926041000_be319_create_session_events`. Forward-only and additive. Do not apply it to the shared project until Prisma and Supabase histories are reconciled.
