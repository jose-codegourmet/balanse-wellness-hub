import type { BookingStatus } from "@balanse/db";
import { requireAdmin, resolveActor } from "../auth";
import { bookingsLimit, cursorPage, decodeCursor } from "../cursor";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson, searchParams } from "../http";
import { bookingStatusPayload } from "../presenters";
import { confirmBooking, rejectBooking, sessionConsumedCapacity } from "../sql";

const TAB_STATUSES: Record<string, BookingStatus[]> = {
  pending: ["HELD_AWAITING_PAYMENT", "PAYMENT_SUBMITTED"],
  confirmed: ["CONFIRMED", "CHECKED_IN"],
  waitlisted: ["WAITLISTED"],
  expired: ["EXPIRED"],
  history: ["CANCELLED", "REJECTED", "NO_SHOW", "COMPLETED", "EXPIRED"],
};

export async function getAdminBookings(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const params = searchParams(req);
  const tab = (params.get("tab") ?? "pending").toLowerCase();
  const statuses = TAB_STATUSES[tab];
  if (!statuses) {
    throw new ApiError(
      400,
      "validation_error",
      "tab must be pending, confirmed, waitlisted, expired, or history.",
    );
  }
  const q = params.get("q") ?? params.get("customer");
  const classId = params.get("classId") ?? params.get("class");
  const date = params.get("date");
  const sort = "reservedAt_desc_id_desc";
  const limit = bookingsLimit(params.get("limit"));
  const cursor = decodeCursor(params.get("cursor"), sort);
  const filters = {
    status: { in: statuses },
    ...(classId ? { session: { classId } } : {}),
    ...(date
      ? {
          session: {
            ...(classId ? { classId } : {}),
            startsAt: {
              gte: new Date(`${date}T00:00:00.000+08:00`),
              lt: new Date(`${date}T23:59:59.999+08:00`),
            },
          },
        }
      : {}),
    ...(q
      ? {
          profile: {
            OR: [
              { fullName: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { contactNumber: { contains: q, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
  };
  const where = {
    ...filters,
    ...(cursor
      ? {
          AND: [
            {
              OR: [
                { reservedAt: { lt: new Date(cursor.key as string) } },
                { reservedAt: new Date(cursor.key as string), id: { lt: cursor.id } },
              ],
            },
          ],
        }
      : {}),
  };
  const [totalCount, rows] = await Promise.all([
    deps.prisma.booking.count({ where: filters }),
    deps.prisma.booking.findMany({
      where,
      take: limit + 1,
      orderBy: [{ reservedAt: "desc" }, { id: "desc" }],
      include: {
        profile: true,
        session: { include: { gymClass: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
  ]);
  const mapped = rows.map((row) => ({
    id: row.id,
    customerName: row.profile.fullName,
    className: row.session.gymClass.name,
    startsAt: row.session.startsAt.toISOString(),
    reservedAt: row.reservedAt.toISOString(),
    payment: row.payments[0]
      ? { method: row.payments[0].method, status: row.payments[0].status }
      : { method: row.paymentMethod, status: null },
    ...bookingStatusPayload(row.status),
  }));
  return ok({
    tab,
    sort,
    ...cursorPage(mapped, limit, totalCount, sort, (row) => row.reservedAt),
  });
}

export async function postAdminConfirm(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  await confirmBooking(deps, id, actor.staffId);
  const booking = await deps.prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new ApiError(404, "booking_not_found", "Booking not found.");
  return ok({ booking: { id: booking.id, ...bookingStatusPayload(booking.status) } });
}

export async function postAdminReject(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const reason = asString(body.reason) ?? "";
  if (!reason.trim()) {
    throw new ApiError(
      400,
      "validation_error",
      "A rejection reason is required (free text; OQ-7).",
      {
        fields: { reason: "Required free-text reason. Shape can later accept a code." },
      },
    );
  }
  const before = await deps.prisma.booking.findUnique({
    where: { id },
    include: { refunds: true, payments: true },
  });
  if (!before) throw new ApiError(404, "booking_not_found", "Booking not found.");
  await rejectBooking(deps, id, actor.staffId, reason);
  const consumed = await sessionConsumedCapacity(deps, before.sessionId);
  const refunds = await deps.prisma.refund.findMany({ where: { bookingId: id } });
  return ok({
    bookingId: id,
    releasedSlot: true,
    consumedCapacity: consumed,
    refundAutoCreated: false,
    refundCount: refunds.length,
    note: "Rejecting a paid booking does not create a refund transfer. Use BE-037 refund state.",
  });
}
