import { requireAdmin, resolveActor } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson } from "../http";
import { paymentStatusLabel } from "../presenters";
import { checkInBooking, markNoShow, reportSessionDrilldown } from "../sql";

export async function getSessionRoster(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const session = await deps.prisma.gymSession.findUnique({
    where: { id },
    include: {
      gymClass: true,
      coaches: { select: { coach: { select: { id: true, name: true, photoKey: true } } } },
    },
  });
  if (!session) throw new ApiError(404, "session_not_found", "Session not found.");
  const bookings = await deps.prisma.booking.findMany({
    where: { sessionId: id },
    include: { profile: true, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  const waitlist = await deps.prisma.waitlistEntry.findMany({
    where: { sessionId: id, status: "WAITING" },
    orderBy: [{ sequence: "asc" }, { joinedAt: "asc" }],
    include: { profile: true },
  });
  const metrics = (await reportSessionDrilldown(deps, id))[0];
  const present = (status: string[]) =>
    bookings
      .filter((row) => status.includes(row.status))
      .map((row) => ({
        bookingId: row.id,
        name: row.profile.fullName,
        payment: row.payments[0]
          ? {
              method: row.payments[0].method,
              status: row.payments[0].status,
              label: paymentStatusLabel(row.payments[0].status),
            }
          : { method: row.paymentMethod, status: null, label: "Not started" },
        attendance: row.status,
      }));
  return ok({
    session: {
      id: session.id,
      className: session.gymClass.name,
      coachName: session.coaches.map(({ coach }) => coach.name).join(" & "),
      coaches: session.coaches.map(({ coach }) => coach),
      startsAt: session.startsAt.toISOString(),
    },
    confirmed: present(["CONFIRMED", "CHECKED_IN"]),
    held: present(["HELD_AWAITING_PAYMENT", "PAYMENT_SUBMITTED"]),
    waitlist: waitlist.map((entry) => ({
      id: entry.id,
      name: entry.profile.fullName,
      sequence: Number(entry.sequence),
      joinedAt: entry.joinedAt.toISOString(),
    })),
    metrics: {
      Capacity: metrics?.capacity ?? session.capacity,
      Confirmed: metrics?.confirmed ?? 0,
      Held: metrics?.held ?? 0,
      Available: metrics?.available ?? 0,
      Waitlisted: metrics?.waitlisted ?? 0,
      "Checked In": metrics?.checkedIn ?? 0,
      "No-show": metrics?.noShow ?? 0,
      Occupancy: Number(metrics?.occupancy ?? 0),
      "Attendance Utilisation": Number(metrics?.attendanceUtilisation ?? 0),
    },
  });
}

export async function postCheckIn(
  deps: ApiDeps,
  req: Request,
  sessionId: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const bookingId = asString(body.bookingId);
  if (!bookingId) {
    throw new ApiError(400, "validation_error", "bookingId is required.", {
      fields: { bookingId: "Required." },
    });
  }
  const booking = await deps.prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.sessionId !== sessionId) {
    throw new ApiError(404, "booking_not_found", "Booking not found on this session.");
  }
  await checkInBooking(deps, bookingId, actor.staffId);
  return ok({ bookingId, status: "CHECKED_IN" });
}

export async function postNoShow(
  deps: ApiDeps,
  req: Request,
  sessionId: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const bookingId = asString(body.bookingId);
  if (!bookingId) {
    throw new ApiError(400, "validation_error", "bookingId is required.", {
      fields: { bookingId: "Required." },
    });
  }
  const booking = await deps.prisma.booking.findUnique({
    where: { id: bookingId },
    include: { refunds: true },
  });
  if (!booking || booking.sessionId !== sessionId) {
    throw new ApiError(404, "booking_not_found", "Booking not found on this session.");
  }
  const refundCountBefore = booking.refunds.length;
  await markNoShow(deps, bookingId, actor.staffId);
  const refundCountAfter = await deps.prisma.refund.count({ where: { bookingId } });
  return ok({
    bookingId,
    status: "NO_SHOW",
    refundCreated: refundCountAfter > refundCountBefore,
  });
}
