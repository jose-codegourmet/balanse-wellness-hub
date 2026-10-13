import type { Prisma } from "@balanse/db";
import {
  CLASS_CHANGE_APPROVAL_PERMISSION,
  CLASS_CHANGE_REASON_MAX,
  CLASS_CHANGE_REASON_MIN,
  CLASS_CHANGE_REQUEST_KINDS,
  type ClassChangeRequest,
  type ClassChangeRequestKind,
  type SubstituteCoachOption,
} from "@balanse/domain";
import { requireAdmin, requirePermission, resolveActor } from "../auth";
import type { AdminApiActor, ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { ok, readJson } from "../http";
import { cancelSessionInTransaction } from "./admin-catalogue";

const requestInclude = {
  requestedByStaff: { select: { name: true } },
  requestedByCoach: { select: { name: true } },
  substituteCoach: { select: { name: true } },
  reviewedByStaff: { select: { name: true } },
} satisfies Prisma.ClassChangeRequestInclude;

const sessionInclude = {
  gymClass: { select: { name: true } },
  coaches: { include: { coach: { select: { name: true } } } },
} satisfies Prisma.GymSessionInclude;

type RequestRow = Prisma.ClassChangeRequestGetPayload<{ include: typeof requestInclude }>;
type SessionRow = Prisma.GymSessionGetPayload<{ include: typeof sessionInclude }>;
type DbTx = Prisma.TransactionClient;

const CONTACT_BOOKING_STATUSES = [
  "HELD_AWAITING_PAYMENT",
  "PAYMENT_SUBMITTED",
  "CONFIRMED",
  "WAITLISTED",
  "CANCELLATION_REQUESTED",
  "RESCHEDULE_REQUESTED",
] as const;

function presentRequest(row: RequestRow): ClassChangeRequest {
  return {
    id: row.id,
    sessionId: row.sessionId,
    session: {
      className: row.sessionClassName,
      startsAt: row.sessionStartsAt.toISOString(),
      endsAt: row.sessionEndsAt.toISOString(),
      coachName: row.sessionCoachName,
    },
    kind: row.kind,
    status: row.status,
    reason: row.reason,
    requestedByStaffId: row.requestedByStaffId,
    requestedByCoachId: row.requestedByCoachId,
    requestedByName: row.requestedByCoach.name || row.requestedByStaff.name,
    proposedStartsAt: row.proposedStartsAt?.toISOString() ?? null,
    proposedEndsAt: row.proposedEndsAt?.toISOString() ?? null,
    substituteCoachId: row.substituteCoachId,
    substituteCoachName: row.substituteCoach?.name ?? null,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    reviewedByStaffId: row.reviewedByStaffId,
    reviewedByName: row.reviewedByStaff?.name ?? null,
    decisionNote: row.decisionNote,
  };
}

function has(actor: AdminApiActor, permission: string): boolean {
  return actor.permissions.some((item) => item === permission);
}

function canReview(actor: AdminApiActor): boolean {
  return has(actor, "schedule.update") || has(actor, "schedule.cancel");
}

function ownsSession(actor: AdminApiActor, session: SessionRow): boolean {
  return Boolean(actor.coachId && session.coaches.some((item) => item.coachId === actor.coachId));
}

function requireCoachSession(actor: AdminApiActor, session: SessionRow): string {
  requirePermission(actor, "schedule.read.own");
  if (!actor.coachId || !ownsSession(actor, session)) {
    throw new ApiError(403, "forbidden", "Only an assigned coach can request this class change.");
  }
  return actor.coachId;
}

function requireUpcomingSession(session: SessionRow, now: Date): void {
  if (session.status === "CANCELLED") {
    throw new ApiError(409, "session_cancelled", "This class is already cancelled.");
  }
  if (session.startsAt <= now) {
    throw new ApiError(409, "session_started", "This class has already started.");
  }
}

function stringField(body: Record<string, unknown>, key: string): string {
  return typeof body[key] === "string" ? body[key].trim() : "";
}

function requestKind(value: unknown): ClassChangeRequestKind {
  if (typeof value === "string" && CLASS_CHANGE_REQUEST_KINDS.some((item) => item === value)) {
    return value as ClassChangeRequestKind;
  }
  throw new ApiError(422, "validation_failed", "Choose a class change type.", {
    fields: { kind: "Choose a class change type." },
  });
}

function reasonFrom(body: Record<string, unknown>): string {
  const reason = stringField(body, "reason");
  if (reason.length < CLASS_CHANGE_REASON_MIN || reason.length > CLASS_CHANGE_REASON_MAX) {
    throw new ApiError(422, "validation_failed", "Give a reason between 10 and 500 characters.", {
      fields: { reason: "Give a reason between 10 and 500 characters." },
    });
  }
  return reason;
}

function noteFrom(body: Record<string, unknown>, required: boolean): string | null {
  const note = stringField(body, "note");
  if ((required && !note) || note.length > 500) {
    throw new ApiError(422, "validation_failed", "Write a note of up to 500 characters.", {
      fields: { note: "Write a note of up to 500 characters." },
    });
  }
  return note || null;
}

async function sessionOr404(tx: DbTx, id: string): Promise<SessionRow> {
  const session = await tx.gymSession.findUnique({ where: { id }, include: sessionInclude });
  if (!session) throw new ApiError(404, "session_not_found", "Session not found.");
  return session;
}

function noStore(response: Response): Response {
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/** Reviewers see all requests; coaches see only requests they made. */
export async function getAdminClassChangeRequests(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  if (!canReview(actor)) {
    requirePermission(actor, "schedule.read.own");
    if (!actor.coachId) throw new ApiError(403, "forbidden", "A linked coach is required.");
  }
  const rows = await deps.prisma.classChangeRequest.findMany({
    where: canReview(actor)
      ? {}
      : { requestedByStaffId: actor.staffId, requestedByCoachId: actor.coachId ?? "" },
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });
  const items = rows.map(presentRequest).sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (b.status === "PENDING" && a.status !== "PENDING") return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return noStore(ok({ items }));
}

/** Active, unassigned coaches, including a flag for overlapping classes. */
export async function getAdminSubstituteCoaches(
  deps: ApiDeps,
  req: Request,
  sessionId: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  if (!has(actor, "schedule.read.all")) requirePermission(actor, "schedule.read.own");
  const session = await deps.prisma.gymSession.findUnique({
    where: { id: sessionId },
    include: sessionInclude,
  });
  if (!session) throw new ApiError(404, "session_not_found", "Session not found.");
  if (!has(actor, "schedule.read.all") && !ownsSession(actor, session)) {
    throw new ApiError(403, "forbidden", "This class is outside your schedule.");
  }
  const assigned = new Set(session.coaches.map((item) => item.coachId));
  const coaches = await deps.prisma.coach.findMany({
    where: { active: true, id: { notIn: [...assigned] } },
    select: { id: true, name: true },
  });
  const overlapping = await deps.prisma.gymSession.findMany({
    where: {
      id: { not: sessionId },
      status: { not: "CANCELLED" },
      startsAt: { lt: session.endsAt },
      endsAt: { gt: session.startsAt },
      coaches: { some: { coachId: { in: coaches.map((coach) => coach.id) } } },
    },
    select: { coaches: { select: { coachId: true } } },
  });
  const busy = new Set(overlapping.flatMap((row) => row.coaches.map((item) => item.coachId)));
  const items: SubstituteCoachOption[] = coaches
    .map((coach) => ({ id: coach.id, name: coach.name, clash: busy.has(coach.id) }))
    .sort((a, b) => Number(a.clash) - Number(b.clash) || a.name.localeCompare(b.name));
  return noStore(ok({ items }));
}

/** An assigned coach can make one pending request per future session. */
export async function postAdminClassChangeRequest(
  deps: ApiDeps,
  req: Request,
  sessionId: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const kind = requestKind(body.kind);
  const reason = reasonFrom(body);
  const now = deps.now();
  const row = await deps.prisma.$transaction(async (tx) => {
    await tx.$queryRawUnsafe("SELECT id FROM public.sessions WHERE id = $1 FOR UPDATE", sessionId);
    const session = await sessionOr404(tx, sessionId);
    const coachId = requireCoachSession(actor, session);
    requireUpcomingSession(session, now);
    const pending = await tx.classChangeRequest.findFirst({
      where: { sessionId, status: "PENDING" },
      select: { id: true },
    });
    if (pending) {
      throw new ApiError(409, "class_change_pending", "This class already has a pending request.");
    }

    let proposedStartsAt: Date | null = null;
    let proposedEndsAt: Date | null = null;
    let substituteCoachId: string | null = null;
    if (kind === "RESCHEDULE") {
      const date = new Date(stringField(body, "proposedStartsAt"));
      if (
        Number.isNaN(date.getTime()) ||
        date <= now ||
        date.getTime() === session.startsAt.getTime()
      ) {
        throw new ApiError(422, "validation_failed", "Choose a different future start time.", {
          fields: { proposedStartsAt: "Choose a different future start time." },
        });
      }
      proposedStartsAt = date;
      proposedEndsAt = new Date(
        date.getTime() + session.endsAt.getTime() - session.startsAt.getTime(),
      );
    }
    if (kind === "SUBSTITUTE") {
      substituteCoachId = stringField(body, "substituteCoachId");
      const coach = substituteCoachId
        ? await tx.coach.findUnique({ where: { id: substituteCoachId }, select: { active: true } })
        : null;
      if (!coach?.active || session.coaches.some((item) => item.coachId === substituteCoachId)) {
        throw new ApiError(422, "validation_failed", "Choose an active, unassigned coach.", {
          fields: { substituteCoachId: "Choose an active, unassigned coach." },
        });
      }
    }
    return tx.classChangeRequest.create({
      data: {
        sessionId,
        kind,
        reason,
        requestedByStaffId: actor.staffId,
        requestedByCoachId: coachId,
        sessionClassName: session.name?.trim() || session.gymClass.name,
        sessionStartsAt: session.startsAt,
        sessionEndsAt: session.endsAt,
        sessionCoachName: session.coaches.map((item) => item.coach.name).join(", "),
        proposedStartsAt,
        proposedEndsAt,
        substituteCoachId,
      },
      include: requestInclude,
    });
  });
  return noStore(ok({ request: presentRequest(row) }));
}

function requirePending(row: RequestRow): void {
  if (row.status !== "PENDING") {
    throw new ApiError(409, "class_change_resolved", "This request has already been resolved.");
  }
}

async function lockedRequest(tx: DbTx, id: string): Promise<RequestRow> {
  await tx.$queryRawUnsafe(
    "SELECT id FROM public.class_change_requests WHERE id = $1 FOR UPDATE",
    id,
  );
  const row = await tx.classChangeRequest.findUnique({ where: { id }, include: requestInclude });
  if (!row) throw new ApiError(404, "class_change_not_found", "Request not found.");
  requirePending(row);
  return row;
}

export async function postWithdrawClassChangeRequest(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const row = await deps.prisma.$transaction(async (tx) => {
    const request = await lockedRequest(tx, id);
    if (
      request.requestedByStaffId !== actor.staffId ||
      !actor.coachId ||
      request.requestedByCoachId !== actor.coachId
    ) {
      throw new ApiError(403, "forbidden", "Only the requesting coach can withdraw this request.");
    }
    return tx.classChangeRequest.update({
      where: { id },
      data: { status: "WITHDRAWN", reviewedAt: deps.now() },
      include: requestInclude,
    });
  });
  return noStore(ok({ request: presentRequest(row) }));
}

function requireReviewer(actor: AdminApiActor, row: RequestRow): void {
  requirePermission(actor, CLASS_CHANGE_APPROVAL_PERMISSION[row.kind]);
  if (row.requestedByStaffId === actor.staffId) {
    throw new ApiError(403, "forbidden", "You cannot review your own request.");
  }
}

async function auditSessionEffect(
  tx: DbTx,
  actor: AdminApiActor,
  row: RequestRow,
  affectedBookingIds: string[],
  beforeStatus: string,
): Promise<void> {
  await tx.auditEvent.create({
    data: {
      entityType: "session",
      entityId: row.sessionId,
      action: row.kind === "CANCEL" ? "session.cancel" : "session.update",
      actorType: "STAFF",
      actorId: actor.staffId,
      metadata: {
        classChangeRequestId: row.id,
        kind: row.kind,
        affectedBookingIds,
        customerNotification: "manual",
      },
      ...(row.kind === "CANCEL" ? { beforeStatus, afterStatus: "CANCELLED" } : {}),
    },
  });
}

/** Approval and the schedule effect commit together; customer contact is manual. */
export async function postApproveClassChangeRequest(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const note = noteFrom(body, false);
  const now = deps.now();
  const row = await deps.prisma.$transaction(async (tx) => {
    const request = await lockedRequest(tx, id);
    requireReviewer(actor, request);
    await tx.$queryRawUnsafe(
      "SELECT id FROM public.sessions WHERE id = $1 FOR UPDATE",
      request.sessionId,
    );
    const session = await sessionOr404(tx, request.sessionId);
    requireUpcomingSession(session, now);
    const affected = await tx.booking.findMany({
      where: { sessionId: session.id, status: { in: [...CONTACT_BOOKING_STATUSES] } },
      select: { id: true },
    });
    if (request.kind === "RESCHEDULE") {
      if (!request.proposedStartsAt || !request.proposedEndsAt || request.proposedStartsAt <= now) {
        throw new ApiError(
          409,
          "proposed_time_expired",
          "The proposed class time is no longer available.",
        );
      }
      await tx.gymSession.update({
        where: { id: session.id },
        data: { startsAt: request.proposedStartsAt, endsAt: request.proposedEndsAt },
      });
    } else if (request.kind === "SUBSTITUTE") {
      const replacement = request.substituteCoachId
        ? await tx.coach.findUnique({ where: { id: request.substituteCoachId } })
        : null;
      if (!replacement?.active || session.coaches.some((item) => item.coachId === replacement.id)) {
        throw new ApiError(
          409,
          "substitute_unavailable",
          "The substitute coach is no longer available.",
        );
      }
      const assignment = session.coaches.find(
        (item) => item.coachId === request.requestedByCoachId,
      );
      if (!assignment) {
        throw new ApiError(
          409,
          "requester_unassigned",
          "The requesting coach no longer teaches this class.",
        );
      }
      await tx.sessionCoach.delete({ where: { id: assignment.id } });
      await tx.sessionCoach.create({
        data: {
          sessionId: session.id,
          coachId: replacement.id,
          coachRate: replacement.defaultRate,
          coachRateType: replacement.rateType,
        },
      });
    } else {
      await cancelSessionInTransaction(tx, actor.staffId, session.id);
    }
    await auditSessionEffect(
      tx,
      actor,
      request,
      affected.map((item) => item.id),
      session.status,
    );
    return tx.classChangeRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedAt: now,
        reviewedByStaffId: actor.staffId,
        decisionNote: note,
      },
      include: requestInclude,
    });
  });
  return noStore(ok({ request: presentRequest(row) }));
}

export async function postDenyClassChangeRequest(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const note = noteFrom(await readJson(req), true);
  const row = await deps.prisma.$transaction(async (tx) => {
    const request = await lockedRequest(tx, id);
    requireReviewer(actor, request);
    return tx.classChangeRequest.update({
      where: { id },
      data: {
        status: "DENIED",
        reviewedAt: deps.now(),
        reviewedByStaffId: actor.staffId,
        decisionNote: note,
      },
      include: requestInclude,
    });
  });
  return noStore(ok({ request: presentRequest(row) }));
}
