# Delta: Events

Base: `openspec/specs/events.md` (requirements 1–8). Merge on archive.

## MODIFIED Requirements

2. Admin lists and opens events at `/events` and `/events/[eventId]`. Authoring is nested at `/schedule/[sessionId]/event`, the same way recurrence nests under a session. `/events/new` is the session picker for create. A session that already has an event cannot take a second one. **A session that has already started cannot take a new event (409 `event_on_started_session`); the form and picker show that reason, and the schedule panel offers Create event only for sessions that have not started. Existing events on past sessions remain editable.**
