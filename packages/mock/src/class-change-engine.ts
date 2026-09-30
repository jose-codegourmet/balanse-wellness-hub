import {
  type AdminCoach,
  type AdminSession,
  type AdminStaff,
  CLASS_CHANGE_REASON_MAX,
  CLASS_CHANGE_REASON_MIN,
  type ClassChangeRequest,
  type CreateClassChangeRequestInput,
  type SubstituteCoachOption,
  sessionDisplayName,
} from "@balanse/domain";

/**
 * Coach class change requests (#337). Pure state helpers; the memory adapter
 * applies an approved change to the session itself.
 */
export type ClassChangeState = {
  requests: ClassChangeRequest[];
};

export type ClassChangeContext = {
  sessions: AdminSession[];
  coaches: AdminCoach[];
  staff: AdminStaff[];
  nowIso: string;
};

let seq = 0;
function nextId(): string {
  seq += 1;
  return `ccr-${Date.now().toString(36)}-${seq}`;
}

function overlaps(a: Pick<AdminSession, "startsAt" | "endsAt">, startsAt: string, endsAt: string) {
  return a.startsAt < endsAt && startsAt < a.endsAt;
}

function durationMs(session: Pick<AdminSession, "startsAt" | "endsAt">): number {
  return new Date(session.endsAt).getTime() - new Date(session.startsAt).getTime();
}

export function staffName(staff: AdminStaff[], staffId: string | null | undefined): string {
  return staff.find((row) => row.id === staffId)?.name ?? "Studio admin";
}

export function sortClassChangeRequests(rows: ClassChangeRequest[]): ClassChangeRequest[] {
  return [...rows].sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (b.status === "PENDING" && a.status !== "PENDING") return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

/** Active coaches who are not already on the session, with a clash flag. */
export function substituteCoachOptions(
  context: ClassChangeContext,
  sessionId: string,
): SubstituteCoachOption[] {
  const session = context.sessions.find((row) => row.id === sessionId);
  if (!session) throw new Error("Session not found");
  const assigned = new Set(session.coaches.map((coach) => coach.id));
  return context.coaches
    .filter((coach) => coach.active && !assigned.has(coach.id))
    .map((coach) => ({
      id: coach.id,
      name: coach.name,
      clash: context.sessions.some(
        (other) =>
          other.id !== session.id &&
          other.status !== "CANCELLED" &&
          other.coaches.some((row) => row.id === coach.id) &&
          overlaps(other, session.startsAt, session.endsAt),
      ),
    }))
    .sort((a, b) => Number(a.clash) - Number(b.clash) || a.name.localeCompare(b.name));
}

export function createClassChangeRequest(
  state: ClassChangeState,
  context: ClassChangeContext,
  input: CreateClassChangeRequestInput,
  requester: { staffId: string; coachId: string },
): ClassChangeRequest {
  const session = context.sessions.find((row) => row.id === input.sessionId);
  if (!session) throw new Error("Session not found");
  if (session.status === "CANCELLED") throw new Error("This class is already cancelled.");
  if (Date.parse(session.startsAt) <= Date.parse(context.nowIso))
    throw new Error("This class has already started.");
  if (!session.coaches.some((coach) => coach.id === requester.coachId))
    throw new Error("Only a coach assigned to this class can request a change.");
  if (state.requests.some((row) => row.sessionId === session.id && row.status === "PENDING"))
    throw new Error("This class already has a change request awaiting approval.");
  const reason = input.reason.trim();
  if (reason.length < CLASS_CHANGE_REASON_MIN || reason.length > CLASS_CHANGE_REASON_MAX)
    throw new Error(
      `Give a reason between ${CLASS_CHANGE_REASON_MIN} and ${CLASS_CHANGE_REASON_MAX} characters.`,
    );

  let proposedStartsAt: string | null = null;
  let proposedEndsAt: string | null = null;
  let substitute: AdminCoach | null = null;
  if (input.kind === "RESCHEDULE") {
    const proposed = input.proposedStartsAt ? Date.parse(input.proposedStartsAt) : Number.NaN;
    if (Number.isNaN(proposed)) throw new Error("Choose the new date and time.");
    if (proposed <= Date.parse(context.nowIso)) throw new Error("Choose a time in the future.");
    if (proposed === Date.parse(session.startsAt))
      throw new Error("Choose a time different from the current one.");
    proposedStartsAt = new Date(proposed).toISOString();
    proposedEndsAt = new Date(proposed + durationMs(session)).toISOString();
  }
  if (input.kind === "SUBSTITUTE") {
    substitute = context.coaches.find((coach) => coach.id === input.substituteCoachId) ?? null;
    if (!substitute || !substitute.active) throw new Error("Choose an active substitute coach.");
    if (session.coaches.some((coach) => coach.id === substitute?.id))
      throw new Error("That coach already teaches this class.");
  }

  const request: ClassChangeRequest = {
    id: nextId(),
    sessionId: session.id,
    session: {
      className: sessionDisplayName(session),
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      coachName: session.coachName,
    },
    kind: input.kind,
    status: "PENDING",
    reason,
    requestedByStaffId: requester.staffId,
    requestedByCoachId: requester.coachId,
    requestedByName:
      context.coaches.find((coach) => coach.id === requester.coachId)?.name ??
      staffName(context.staff, requester.staffId),
    proposedStartsAt,
    proposedEndsAt,
    substituteCoachId: substitute?.id ?? null,
    substituteCoachName: substitute?.name ?? null,
    createdAt: context.nowIso,
    reviewedAt: null,
    reviewedByStaffId: null,
    reviewedByName: null,
    decisionNote: null,
  };
  state.requests.push(request);
  return request;
}

export function findPendingRequest(state: ClassChangeState, id: string): ClassChangeRequest {
  const request = state.requests.find((row) => row.id === id);
  if (!request) throw new Error("Request not found");
  if (request.status !== "PENDING") throw new Error("This request was already resolved.");
  return request;
}

export function withdrawClassChangeRequest(
  state: ClassChangeState,
  id: string,
  staffId: string,
  nowIso: string,
): ClassChangeRequest {
  const request = findPendingRequest(state, id);
  if (request.requestedByStaffId !== staffId)
    throw new Error("Only the coach who asked can withdraw this request.");
  request.status = "WITHDRAWN";
  request.reviewedAt = nowIso;
  return request;
}

export function resolveClassChangeRequest(
  request: ClassChangeRequest,
  context: ClassChangeContext,
  decision: "APPROVED" | "DENIED",
  reviewerStaffId: string,
  note: string | null,
): ClassChangeRequest {
  request.status = decision;
  request.reviewedAt = context.nowIso;
  request.reviewedByStaffId = reviewerStaffId;
  request.reviewedByName = staffName(context.staff, reviewerStaffId);
  request.decisionNote = note?.trim() || null;
  return request;
}
