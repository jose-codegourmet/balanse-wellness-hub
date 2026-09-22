# Spec: Recurring schedules

## Requirements

1. Admin may duplicate all non-cancelled sessions in an inclusive source range of at most 63 days to a new start date. Relative day/time offsets, class, name, duration, price, capacity, and coach assignments are preserved.
2. Admin may turn one non-cancelled session with an active class and active coaches into a bounded weekly recurrence of at most one year, selecting one or more weekdays.
3. Generated occurrences are ordinary sessions. They use the existing booking, capacity, cancellation, roster, and reporting rules; bookings are never copied.
4. Generated occurrences capture current coach default compensation as new immutable session-assignment snapshots. They do not copy the source occurrence's historical rate snapshots.
5. Generation is idempotent at the class/start-time boundary: an exact existing match is skipped and reported, never duplicated or overwritten.
6. New occurrences default to draft. Admin may explicitly publish the generated batch. The booking cutoff remains derived from each generated start time by the canonical booking rules.
7. Weekly rules are stored in `session_recurrence_rules` with `Asia/Manila` timezone and linked to generated sessions. The source session is marked as part of the rule.
8. Holiday calendars, per-occurrence exceptions, series-wide editing/deletion, and coach self-service remain out of scope.
9. UI reads and writes through `MockDataAdapter` during the mock phase. Backend schema and HTTP contracts are implemented independently without wiring the UI to `/api/*`.

## Routes

- `/schedule/duplicate`
- `/schedule/[sessionId]/recurrence`
- `POST /api/admin/sessions/duplicate`
- `POST /api/admin/sessions/{id}/recurrence`
