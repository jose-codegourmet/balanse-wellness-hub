import type { BookingStatus } from "@balanse/db";
import { toPublicSession } from "@balanse/domain";
import { requireAdmin, requireOwnedSession, resolveActor } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson } from "../http";
import { shapeRoster } from "../sensitive";
import {
  checkInBooking,
  markNoShow,
  reportSessionDrilldown,
  sessionConsumedCapacity,
} from "../sql";
import { presentAdminSession, SESSION_VENUE_SELECT } from "./admin-catalogue";

/** Bucket boundaries mirror the mock's `RosterPage` sub-grouping (#361). */
const CONFIRMED_STATUSES: BookingStatus[] = ["CONFIRMED", "CHECKED_IN", "COMPLETED", "NO_SHOW"];
const HELD_STATUSES: BookingStatus[] = [
  "HELD_AWAITING_PAYMENT",
  "PAYMENT_SUBMITTED",
  "CANCELLATION_REQUESTED",
  "RESCHEDULE_REQUESTED",
];

export async function getSessionRoster(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  await requireOwnedSession(deps, actor, id, "roster.read.own", "roster.read.all");
  const session = await deps.prisma.gymSession.findUnique({
    where: { id },
    include: {
      gymClass: true,
      venue: { select: SESSION_VENUE_SELECT },
      coaches: { include: { coach: true } },
    },
  });
  if (!session) throw new ApiError(404, "session_not_found", "Session not found.");
  const consumed = await sessionConsumedCapacity(deps, id);
  const presentedSession = await presentAdminSession(deps, session, consumed);
  const publicSession = toPublicSession(presentedSession);

  const bookings = await deps.prisma.booking.findMany({
    where: {
      sessionId: id,
      status: { in: [...CONFIRMED_STATUSES, ...HELD_STATUSES, "WAITLISTED"] },
    },
    orderBy: { reservedAt: "asc" },
    include: {
      profile: { include: { onboarding: { include: { interests: true } } } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      refunds: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const presentBooking = (row: (typeof bookings)[number]) => {
    const refund = row.refunds[0];
    return {
      id: row.id,
      customerId: row.profileId,
      customerName:
        `${row.profile.firstName} ${row.profile.lastName}`.trim() || row.profile.fullName,
      sessionId: row.sessionId,
      status: row.status,
      paymentMethod: row.paymentMethod,
      paymentStatus: row.payments[0]?.status ?? "NONE",
      refundStatus: refund?.status ?? "NOT_APPLICABLE",
      holdExpiresAt: row.holdExpiresAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      session: publicSession,
    };
  };

  const confirmed = bookings
    .filter((row) => CONFIRMED_STATUSES.includes(row.status))
    .map(presentBooking);
  const held = bookings.filter((row) => HELD_STATUSES.includes(row.status)).map(presentBooking);
  const waitlisted = bookings.filter((row) => row.status === "WAITLISTED").map(presentBooking);

  const people: Record<string, unknown> = {};
  for (const row of bookings) {
    if (people[row.profileId]) continue;
    const avatarUrl = row.profile.avatarKey
      ? await deps.storage.createSignedUrl("avatars", row.profile.avatarKey, 600)
      : null;
    people[row.profileId] = {
      customerId: row.profileId,
      firstName: row.profile.firstName,
      lastName: row.profile.lastName,
      nickname: row.profile.nickname,
      avatarUrl,
      showOnPublicRoster: row.profile.showOnPublicRoster,
      onboarding: row.profile.onboarding
        ? {
            goals: row.profile.onboarding.goals,
            goalsOther: row.profile.onboarding.goalsOther,
            experienceLevel: row.profile.onboarding.experienceLevel,
            interestClassIds: row.profile.onboarding.interests.map((interest) => interest.classId),
            interestsOther: row.profile.onboarding.interestsOther,
            heardFrom: row.profile.onboarding.heardFrom,
            heardFromOther: row.profile.onboarding.heardFromOther,
            updatedAt: row.profile.onboarding.updatedAt.toISOString(),
          }
        : null,
    };
  }

  const metrics = (await reportSessionDrilldown(deps, id))[0];
  return ok(
    shapeRoster(actor, {
      session: presentedSession,
      confirmed,
      held,
      waitlisted,
      capacity: metrics?.capacity ?? session.capacity,
      confirmedCount: metrics?.confirmed ?? confirmed.length,
      heldCount: metrics?.held ?? held.length,
      available: metrics?.available ?? Math.max(0, session.capacity - consumed),
      waitlistedCount: metrics?.waitlisted ?? waitlisted.length,
      checkedIn: metrics?.checkedIn ?? 0,
      noShow: metrics?.noShow ?? 0,
      occupancy: Number(metrics?.occupancy ?? 0),
      attendanceUtilisation: Number(metrics?.attendanceUtilisation ?? 0),
      people,
    }),
  );
}

export async function postCheckIn(
  deps: ApiDeps,
  req: Request,
  sessionId: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  await requireOwnedSession(
    deps,
    actor,
    sessionId,
    "attendance.manage.own",
    "attendance.manage.all",
  );
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
  await requireOwnedSession(
    deps,
    actor,
    sessionId,
    "attendance.manage.own",
    "attendance.manage.all",
  );
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
