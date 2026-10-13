import type { BookingStatus, Prisma } from "@balanse/db";
import {
  type CoachStudent,
  type CoachStudentDetail,
  type CoachStudentSession,
  type CustomerOnboardingAnswers,
  isCoachAuthorizationRole,
} from "@balanse/domain";
import { requireAdmin, requirePermission, resolveActor } from "../auth";
import type { AdminApiActor, ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { ok } from "../http";

const ATTENDED_STATUSES: BookingStatus[] = ["CHECKED_IN", "COMPLETED"];
const UPCOMING_STATUSES: BookingStatus[] = [
  "HELD_AWAITING_PAYMENT",
  "PAYMENT_SUBMITTED",
  "CONFIRMED",
  "CANCELLATION_REQUESTED",
  "RESCHEDULE_REQUESTED",
];

const coachStudentBookingInclude = {
  profile: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      fullName: true,
      nickname: true,
      avatarKey: true,
      email: true,
      contactNumber: true,
      onboarding: {
        select: {
          goals: true,
          goalsOther: true,
          experienceLevel: true,
          interestsOther: true,
          interests: { select: { classId: true } },
          updatedAt: true,
        },
      },
    },
  },
  session: {
    select: { id: true, name: true, startsAt: true, customerPrice: true, gymClass: true },
  },
  payments: {
    where: { status: { in: ["VERIFIED", "CASH_RECEIVED"] } },
    select: { id: true },
  },
  bundleRedemptions: { where: { status: "CONSUMED" }, select: { id: true } },
} satisfies Prisma.BookingInclude;

type CoachStudentBooking = Prisma.BookingGetPayload<{
  include: typeof coachStudentBookingInclude;
}>;

function coachIdFor(actor: AdminApiActor): string {
  if (!isCoachAuthorizationRole(actor.roleKey) || !actor.coachId) {
    throw new ApiError(
      403,
      "coach_profile_required",
      "A linked active Coach profile is required to view students.",
    );
  }
  return actor.coachId;
}

function isContribution(booking: CoachStudentBooking): boolean {
  return booking.payments.length > 0 || booking.bundleRedemptions.length > 0;
}

function toSession(booking: CoachStudentBooking): CoachStudentSession {
  return {
    bookingId: booking.id,
    sessionId: booking.sessionId,
    className: booking.session.name?.trim() || booking.session.gymClass.name,
    startsAt: booking.session.startsAt.toISOString(),
    status: booking.status,
    contributionPhp: isContribution(booking) ? Number(booking.session.customerPrice) : 0,
  };
}

/** The coach workspace deliberately has no referral/heard-from attribution payload. */
function presentOnboarding(
  onboarding: CoachStudentBooking["profile"]["onboarding"],
): CustomerOnboardingAnswers | null {
  if (!onboarding) return null;
  return {
    goals: onboarding.goals as CustomerOnboardingAnswers["goals"],
    goalsOther: onboarding.goalsOther,
    experienceLevel: onboarding.experienceLevel as CustomerOnboardingAnswers["experienceLevel"],
    interestClassIds: onboarding.interests.map((interest) => interest.classId),
    interestsOther: onboarding.interestsOther,
    heardFrom: null,
    heardFromOther: "",
    updatedAt: onboarding.updatedAt.toISOString(),
  };
}

async function listForCoach(
  deps: ApiDeps,
  coachId: string,
  customerId?: string,
): Promise<CoachStudentDetail[]> {
  const bookings = await deps.prisma.booking.findMany({
    where: {
      ...(customerId ? { profileId: customerId } : {}),
      session: { coaches: { some: { coachId } } },
    },
    include: coachStudentBookingInclude,
  });
  const grouped = new Map<string, CoachStudentBooking[]>();
  for (const booking of bookings) {
    const rows = grouped.get(booking.profileId) ?? [];
    rows.push(booking);
    grouped.set(booking.profileId, rows);
  }

  const now = deps.now();
  const students = await Promise.all(
    [...grouped.values()].flatMap(async (rows): Promise<CoachStudentDetail[]> => {
      const upcoming = rows
        .filter(
          (booking) =>
            booking.session.startsAt >= now && UPCOMING_STATUSES.includes(booking.status),
        )
        .map(toSession)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
      const attendance = rows
        .filter((booking) => ATTENDED_STATUSES.includes(booking.status))
        .map(toSession)
        .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
      if (upcoming.length === 0 && attendance.length === 0) return [];

      const profile = rows[0].profile;
      const avatarUrl = profile.avatarKey
        ? await deps.storage.createSignedUrl("avatars", profile.avatarKey, 600).catch(() => null)
        : null;
      const detail: CoachStudentDetail = {
        id: profile.id,
        fullName: `${profile.firstName} ${profile.lastName}`.trim() || profile.fullName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        nickname: profile.nickname,
        avatarUrl,
        email: profile.email,
        contactNumber: profile.contactNumber,
        sessionsAttended: attendance.length,
        contributionPhp: rows.reduce(
          (total, booking) =>
            total + (isContribution(booking) ? Number(booking.session.customerPrice) : 0),
          0,
        ),
        lastAttendedAt: attendance[0]?.startsAt ?? null,
        nextBooking: upcoming[0] ?? null,
        upcomingBookingCount: upcoming.length,
        upcoming,
        attendance,
        onboarding: presentOnboarding(profile.onboarding),
      };
      return [detail];
    }),
  );

  return students.flat().sort((a, b) => {
    if (a.nextBooking && b.nextBooking) {
      return a.nextBooking.startsAt.localeCompare(b.nextBooking.startsAt);
    }
    if (a.nextBooking) return -1;
    if (b.nextBooking) return 1;
    return (b.lastAttendedAt ?? "").localeCompare(a.lastAttendedAt ?? "");
  });
}

function presentStudentSummary(student: CoachStudentDetail): CoachStudent {
  return {
    id: student.id,
    fullName: student.fullName,
    firstName: student.firstName,
    lastName: student.lastName,
    nickname: student.nickname,
    avatarUrl: student.avatarUrl,
    email: student.email,
    contactNumber: student.contactNumber,
    sessionsAttended: student.sessionsAttended,
    contributionPhp: student.contributionPhp,
    lastAttendedAt: student.lastAttendedAt,
    nextBooking: student.nextBooking,
    upcomingBookingCount: student.upcomingBookingCount,
  };
}

/** WIRE-2101 — students are scoped exclusively to the signed-in Coach's sessions. */
export async function getCoachStudents(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  requirePermission(actor, "roster.read.own");
  const items = (await listForCoach(deps, coachIdFor(actor))).map(presentStudentSummary);
  return ok({ items }, { "Cache-Control": "no-store" });
}

/** A non-student stays indistinguishable from an unavailable student to the calling coach. */
export async function getCoachStudent(
  deps: ApiDeps,
  req: Request,
  customerId: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  requirePermission(actor, "roster.read.own");
  const student = (await listForCoach(deps, coachIdFor(actor), customerId))[0];
  return ok(student ?? null, { "Cache-Control": "no-store" });
}
