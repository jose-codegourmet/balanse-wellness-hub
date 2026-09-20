import { requireAdmin, resolveActor } from "../auth";
import { cursorPage, decodeCursor, parseLimit } from "../cursor";
import type { ApiDeps } from "../deps";
import { asString, ok, readJson, searchParams } from "../http";
import { OQ2_UNENFORCED_RULES } from "../settings";
import {
  resolveCancellationRequest,
  resolveRescheduleRequest,
  sessionConsumedCapacity,
} from "../sql";

export async function getCancellationRequests(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const sort = "requestedAt_desc_id_desc";
  const params = searchParams(req);
  const limit = parseLimit(params.get("limit"));
  const cursor = decodeCursor(params.get("cursor"), sort);
  const filters = { resolution: "OPEN" as const };
  const where = {
    ...filters,
    ...(cursor
      ? {
          AND: [
            {
              OR: [
                { requestedAt: { lt: new Date(cursor.key as string) } },
                { requestedAt: new Date(cursor.key as string), id: { lt: cursor.id } },
              ],
            },
          ],
        }
      : {}),
  };
  const [totalCount, rows] = await Promise.all([
    deps.prisma.cancellationRequest.count({ where: filters }),
    deps.prisma.cancellationRequest.findMany({
      where,
      take: limit + 1,
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
      include: {
        booking: {
          include: { profile: true, session: { include: { gymClass: true } }, refunds: true },
        },
      },
    }),
  ]);
  const items = rows.map((row) => ({
    id: row.id,
    bookingId: row.bookingId,
    customerName: row.booking.profile.fullName,
    className: row.booking.session.gymClass.name,
    reason: row.reason,
    requestedAt: row.requestedAt.toISOString(),
    resolution: row.resolution,
    bookingStatus: row.booking.status,
  }));
  return ok({ sort, ...cursorPage(items, limit, totalCount, sort, (row) => row.requestedAt) });
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
  const sort = "requestedAt_desc_id_desc";
  const params = searchParams(req);
  const limit = parseLimit(params.get("limit"));
  const cursor = decodeCursor(params.get("cursor"), sort);
  const filters = { resolution: "OPEN" as const };
  const where = {
    ...filters,
    ...(cursor
      ? {
          AND: [
            {
              OR: [
                { requestedAt: { lt: new Date(cursor.key as string) } },
                { requestedAt: new Date(cursor.key as string), id: { lt: cursor.id } },
              ],
            },
          ],
        }
      : {}),
  };
  const [totalCount, rows] = await Promise.all([
    deps.prisma.rescheduleRequest.count({ where: filters }),
    deps.prisma.rescheduleRequest.findMany({
      where,
      take: limit + 1,
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
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
      id: row.id,
      bookingId: row.bookingId,
      customerName: row.booking.profile.fullName,
      fromSessionId: row.fromSessionId,
      targetSessionId: row.targetSessionId,
      className: row.fromSession.gymClass.name,
      requestedAt: row.requestedAt.toISOString(),
      resolution: row.resolution,
      targetRemaining: row.targetSession
        ? row.targetSession.capacity - (targetConsumed ?? 0)
        : null,
      unenforcedRules: [...OQ2_UNENFORCED_RULES],
    });
  }
  return ok({ sort, ...cursorPage(items, limit, totalCount, sort, (row) => row.requestedAt) });
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
