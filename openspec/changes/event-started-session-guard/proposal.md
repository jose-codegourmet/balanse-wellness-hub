# Change: No new events on started sessions

## Why

An event could be created for a session that was already under way or over. The event would then be publishable for a class nobody can book, and the schedule panel offered "Create event" on past sessions.

## What

- `POST /api/admin/events` returns 409 `event_on_started_session` when the session's `startsAt <= now`. Existing events on past sessions stay editable, publishable, cancellable and archivable as before.
- `EVENT_CONFLICT_CODES` / `EVENT_CONFLICT_MESSAGES` gain `event_on_started_session` ("An event cannot be created for a session that has already started.").
- The event form bound to a started session (`/schedule/[sessionId]/event` with no existing event) renders the blocked message instead of the composer; the `/events/new` session picker marks started sessions as blocked with that message.
- The schedule selected-session panel hides the Event section for started sessions unless an event already exists.
- `docs/backend/session-events.md` and `docs/backend/api-routes.md` record the rule. The API enforces it; the database trigger is unchanged (follow-up below).

## Decisions (Jose, 2026-10-13)

- The cut-off is session start, not the booking cutoff, so an event can still be authored up to the minute the class begins.
- Existing events are never retroactively blocked.

## Out of scope

Blocking publish (as opposed to create) on started sessions, and automatic archiving of events once their session is past.

## Validation

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`
- Manual: open `/schedule/<startedSessionId>/event` → blocked message; `/events/new` lists the started session as blocked; a session with an existing event still shows it in the panel.
