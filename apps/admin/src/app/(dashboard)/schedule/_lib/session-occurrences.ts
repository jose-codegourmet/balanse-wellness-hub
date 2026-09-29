import {
  type AdminSession,
  datesForWeeklyRecurrence,
  isManilaYmd,
  manilaYmd,
  shiftSessionIsoToDate,
  type Weekday,
} from "@balanse/domain";

/** One date a session would run on, with anything already on the schedule it collides with. */
export type PlannedOccurrence = {
  ymd: string;
  startsAt: string;
  endsAt: string;
  /** The date typed on the form. Generated repeats come after it. */
  isFirst: boolean;
  conflicts: OccurrenceConflict[];
};

export type OccurrenceConflict =
  /** Same class at the same start. Generated repeats skip these; the first date does not. */
  | { kind: "duplicate"; session: AdminSession }
  /** A chosen coach is teaching another session that overlaps. */
  | { kind: "coach"; session: AdminSession; coachNames: string[] };

export type OccurrencePlanInput = {
  startsAt: string;
  endsAt: string;
  repeat: { weekdays: readonly Weekday[]; endsOn: string } | null;
};

export type ConflictContext = {
  sessions: readonly AdminSession[];
  classId: string;
  coachIds: readonly string[];
  /** The session being edited, so it never conflicts with itself. */
  ignoreSessionId?: string;
};

/** Dates the form would create: the first session, then any weekly repeats after it. */
export function planOccurrences(
  input: OccurrencePlanInput,
  context: ConflictContext,
): PlannedOccurrence[] {
  if (!Number.isFinite(Date.parse(input.startsAt)) || !Number.isFinite(Date.parse(input.endsAt))) {
    return [];
  }
  const firstYmd = manilaYmd(input.startsAt);
  const repeatDates =
    input.repeat && isManilaYmd(input.repeat.endsOn) && input.repeat.weekdays.length > 0
      ? datesForWeeklyRecurrence({
          startsOn: firstYmd,
          endsOn: input.repeat.endsOn,
          weekdays: input.repeat.weekdays,
        }).filter((ymd) => ymd !== firstYmd)
      : [];
  const durationMs = Date.parse(input.endsAt) - Date.parse(input.startsAt);

  return [firstYmd, ...repeatDates].map((ymd, index) => {
    const startsAt = index === 0 ? input.startsAt : shiftSessionIsoToDate(input.startsAt, ymd);
    const endsAt =
      index === 0 ? input.endsAt : new Date(Date.parse(startsAt) + durationMs).toISOString();
    return {
      ymd,
      startsAt,
      endsAt,
      isFirst: index === 0,
      conflicts: findConflicts({ startsAt, endsAt }, context),
    };
  });
}

export function findConflicts(
  slot: { startsAt: string; endsAt: string },
  context: ConflictContext,
): OccurrenceConflict[] {
  const start = Date.parse(slot.startsAt);
  const end = Date.parse(slot.endsAt);
  const conflicts: OccurrenceConflict[] = [];
  for (const session of context.sessions) {
    if (session.id === context.ignoreSessionId || session.status === "CANCELLED") continue;
    const otherStart = Date.parse(session.startsAt);
    const otherEnd = Date.parse(session.endsAt);
    if (session.classId === context.classId && otherStart === start) {
      conflicts.push({ kind: "duplicate", session });
      continue;
    }
    if (!(otherStart < end && start < otherEnd)) continue;
    const shared = session.coaches.filter((coach) => context.coachIds.includes(coach.id));
    // Sessions may share a time and a venue; how the space is used is the studio's call.
    // Only a coach who would be in two places at once is worth flagging.
    if (shared.length > 0) {
      conflicts.push({ kind: "coach", session, coachNames: shared.map((coach) => coach.name) });
    }
  }
  return conflicts;
}

/** Generated repeats skip exact class/start matches, so only the rest will be created. */
export function occurrenceWillBeSkipped(occurrence: PlannedOccurrence): boolean {
  return !occurrence.isFirst && occurrence.conflicts.some((row) => row.kind === "duplicate");
}
