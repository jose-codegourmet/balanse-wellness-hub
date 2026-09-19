import { requireAdmin, resolveActor } from "../auth";
import type { ApiDeps } from "../deps";
import { asString, ok, pagination, readJson, searchParams } from "../http";
import { OQ2_UNENFORCED_RULES } from "../settings";
import {
  resolveCancellationRequest,
  resolveRescheduleRequest,
  sessionConsumedCapacity,
} from "../sql";

export async function getCancellationRequests(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const { page, pageSize, skip } = pagination(searchParams(req));
  const [total, items] = await Promise.all([
    deps.prisma.cancellationRequest.count({ where: { resolution: "OPEN" } }),
    deps.prisma.cancellationRequest.findMany({
      where: { resolution: "OPEN" },
      skip,
      take: pageSize,
      orderBy: { requestedAt: "asc" },
      include: {
        booking: {
          include: { profile: true, session: { include: { gymClass: true } }, refunds: true },
        },
      },
    }),
  ]);
  return ok({ page, pageSize, total, items });
}

export async function completeCancellation(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const request = await deps.prisma.cancellationRequest.findUnique({
    where: { id },
    include: { booking: true },
  });
  const sessionId = request?.booking.sessionId;
  await resolveCancellationRequest(
    deps,
    id,
    actor.staffId,
    "COMPLETED",
    asString(body.note) ?? null,
  );
  const consumed = sessionId ? await sessionConsumedCapacity(deps, sessionId) : null;
  return ok({ requestId: id, resolution: "COMPLETED", consumedCapacity: consumed });
}

export async function rejectCancellation(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  await resolveCancellationRequest(
    deps,
    id,
    actor.staffId,
    "REJECTED",
    asString(body.note) ?? null,
  );
  const request = await deps.prisma.cancellationRequest.findUnique({
    where: { id },
    include: { booking: true },
  });
  return ok({
    requestId: id,
    resolution: "REJECTED",
    bookingStatus: request?.booking.status,
  });
}

export async function getRescheduleRequests(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const { page, pageSize, skip } = pagination(searchParams(req));
  const [total, rows] = await Promise.all([
    deps.prisma.rescheduleRequest.count({ where: { resolution: "OPEN" } }),
    deps.prisma.rescheduleRequest.findMany({
      where: { resolution: "OPEN" },
      skip,
      take: pageSize,
      orderBy: { requestedAt: "asc" },
      include: {
        booking: { include: { profile: true } },
        fromSession: { include: { gymClass: true, coach: true } },
        targetSession: { include: { gymClass: true, coach: true } },
      },
    }),
  ]);
  const items = [];
  for (const row of rows) {
    const targetConsumed = row.targetSession
      ? await sessionConsumedCapacity(deps, row.targetSession.id)
      : null;
    items.push({
      ...row,
      targetRemaining: row.targetSession
        ? row.targetSession.capacity - (targetConsumed ?? 0)
        : null,
      unenforcedRules: [...OQ2_UNENFORCED_RULES],
    });
  }
  return ok({ page, pageSize, total, items });
}

export async function approveReschedule(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  await resolveRescheduleRequest(deps, id, actor.staffId, "COMPLETED", asString(body.note) ?? null);
  const request = await deps.prisma.rescheduleRequest.findUnique({
    where: { id },
    include: { booking: true },
  });
  return ok({
    requestId: id,
    resolution: "COMPLETED",
    bookingId: request?.bookingId,
    fromSessionId: request?.fromSessionId,
    toSessionId: request?.booking.sessionId,
    priceDifferenceComputed: false,
    unenforcedRules: [...OQ2_UNENFORCED_RULES],
  });
}

export async function rejectReschedule(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  await resolveRescheduleRequest(deps, id, actor.staffId, "REJECTED", asString(body.note) ?? null);
  const request = await deps.prisma.rescheduleRequest.findUnique({
    where: { id },
    include: { booking: true },
  });
  return ok({ requestId: id, resolution: "REJECTED", bookingStatus: request?.booking.status });
}
