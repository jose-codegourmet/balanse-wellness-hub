# Session coach assignments

Classes are standalone catalogue entries. A scheduled class session requires **at least one coach**, supports multiple coaches, and remains the unit customers book. Booking/session foreign keys and capacity rules are unchanged.

## Data and API

- The currently staged backend `GymClass` has no coach links. The previous `ClassCoach` staffing relation is retired. A later UI amendment adds an optional marketing-only roster, rich-text/image metadata and custom session titles in the mock lane; these are not yet persisted by this backend migration. Do not use the marketing roster to infer or constrain session assignments.
- `GymSession.coaches` contains `SessionCoach` records, unique by session/coach.
- Each assignment stores its own exact-decimal compensation and rate type. New assignments snapshot the coach's current defaults; retained assignments preserve their rates. Snapshots cannot be edited directly.
- POST `/api/admin/sessions` requires `coachIds: ["coach-a", "coach-b"]`. PATCH uses the same array to replace assignments, or omits it to retain them. Empty/duplicate/unknown IDs are rejected. New assignments require active coaches; retained inactive coaches remain valid.
- Legacy `coachId` and client-supplied rate/snapshot fields are rejected on session writes. The staff/coach link still uses its unrelated singular `coachId`.
- Public session and booking responses expose `coaches` with public identity fields only. Admin session responses include assignment snapshots. No UI is wired to HTTP: screens still use `MockDataAdapter`.
- Costs sum each coach's snapshot; hourly assignments multiply duration in hours, rounded per assignment to two decimal places. Booking revenue is counted once per session. Coach-related revenue is non-additive across coaches.

## Migration and rollout

`20260921120000_session_coach_assignments` is a forward-only, transactional migration. It backfills existing session coach/rate snapshots before removing the old session columns. Old class links are retained in private `app_private.legacy_class_coaches` for recovery; they are not used to infer session assignments.

Before applying it, inspect sessions without a coach:

```sql
SELECT id, "classId", "startsAt", status FROM public.sessions WHERE "coachId" IS NULL;
```

Assign a real coach to each affected session under the old model, with the appropriate historical rate snapshot. Do not invent a coach or silently delete historical sessions. The migration fails if any unassigned session remains, including draft/cancelled sessions.

Deploy the migration and matching server together: the old single-coach API is incompatible. Follow the existing `pnpm --filter @balanse/db db:deploy` process against the configured project, then generate the Prisma client. Local verification does not deploy to hosted Supabase.

RLS permits assignment-table reads/writes only for admins. Public queries explicitly select public coach identity fields through the server; they never expose assignment rates. Deferred constraints reject a committed session with no coaches. Parent-row writes serialize concurrent assignment removals, while allowing a complete replacement in one transaction. Deleting a session cascades its assignments; deleting an assigned coach is restricted.
