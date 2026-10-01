import type { BookingStatus } from "./enums";
import type { CustomerOnboardingAnswers } from "./onboarding";
import { splitFullName } from "./profile";
import type { CustomerBooking, CustomerProfile } from "./types";

export type CoachStudentSession = {
  bookingId: string;
  sessionId: string;
  className: string;
  startsAt: string;
  status: BookingStatus;
  contributionPhp: number;
};

export type CoachStudent = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  avatarUrl: string | null;
  email: string;
  contactNumber: string;
  sessionsAttended: number;
  contributionPhp: number;
  lastAttendedAt: string | null;
  nextBooking: CoachStudentSession | null;
  upcomingBookingCount: number;
};

export type CoachStudentDetail = CoachStudent & {
  upcoming: CoachStudentSession[];
  attendance: CoachStudentSession[];
  /** Goals / experience / interests for this coach's own student. Never referral data. */
  onboarding: CustomerOnboardingAnswers | null;
};

const ATTENDED_STATUSES = new Set<BookingStatus>(["CHECKED_IN", "COMPLETED"]);
const UPCOMING_STATUSES = new Set<BookingStatus>([
  "HELD_AWAITING_PAYMENT",
  "PAYMENT_SUBMITTED",
  "CONFIRMED",
  "CANCELLATION_REQUESTED",
  "RESCHEDULE_REQUESTED",
]);

function hasCoach(booking: CustomerBooking, coachId: string): boolean {
  return booking.session.coaches.some((coach) => coach.id === coachId);
}

function isContribution(booking: CustomerBooking): boolean {
  return (
    booking.paymentStatus === "VERIFIED" ||
    booking.paymentStatus === "CASH_RECEIVED" ||
    booking.redemption?.status === "CONSUMED"
  );
}

function toSession(booking: CustomerBooking): CoachStudentSession {
  return {
    bookingId: booking.id,
    sessionId: booking.sessionId,
    className: booking.session.name?.trim() || booking.session.className,
    startsAt: booking.session.startsAt,
    status: booking.status,
    contributionPhp: isContribution(booking) ? booking.session.pricePhp : 0,
  };
}

/**
 * Mock-only aggregation for the teaching workspace. Contribution is the paid
 * booking or consumed-package class value attributable to this coach's session;
 * it is not a studio-wide sales or payroll figure.
 */
export function buildCoachStudents(
  profiles: readonly CustomerProfile[],
  bookings: readonly CustomerBooking[],
  coachId: string,
  nowIso: string,
  onboardingFor: (customerId: string) => CustomerOnboardingAnswers | null = () => null,
): CoachStudentDetail[] {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const grouped = new Map<string, CustomerBooking[]>();

  for (const booking of bookings) {
    if (!hasCoach(booking, coachId)) continue;
    const rows = grouped.get(booking.customerId) ?? [];
    rows.push(booking);
    grouped.set(booking.customerId, rows);
  }

  return [...grouped.entries()]
    .flatMap(([customerId, rows]) => {
      const upcoming = rows
        .filter(
          (booking) => booking.session.startsAt >= nowIso && UPCOMING_STATUSES.has(booking.status),
        )
        .map(toSession)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
      const attendance = rows
        .filter((booking) => ATTENDED_STATUSES.has(booking.status))
        .map(toSession)
        .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

      if (upcoming.length === 0 && attendance.length === 0) return [];
      const profile = profileById.get(customerId);
      const contributionPhp = rows.reduce(
        (total, booking) => total + (isContribution(booking) ? booking.session.pricePhp : 0),
        0,
      );
      const fullName = profile?.fullName ?? rows[0]?.customerName ?? "Student";
      const name = profile
        ? { firstName: profile.firstName, lastName: profile.lastName }
        : splitFullName(fullName);
      return [
        {
          id: customerId,
          fullName,
          firstName: name.firstName,
          lastName: name.lastName,
          nickname: profile?.nickname ?? null,
          avatarUrl: profile?.avatarUrl ?? null,
          onboarding: onboardingFor(customerId),
          email: profile?.email ?? "",
          contactNumber: profile?.contactNumber ?? "",
          sessionsAttended: attendance.length,
          contributionPhp,
          lastAttendedAt: attendance[0]?.startsAt ?? null,
          nextBooking: upcoming[0] ?? null,
          upcomingBookingCount: upcoming.length,
          upcoming,
          attendance,
        },
      ];
    })
    .sort((a, b) => {
      if (a.nextBooking && b.nextBooking) {
        return a.nextBooking.startsAt.localeCompare(b.nextBooking.startsAt);
      }
      if (a.nextBooking) return -1;
      if (b.nextBooking) return 1;
      return (b.lastAttendedAt ?? "").localeCompare(a.lastAttendedAt ?? "");
    });
}

export function coachStudentById(
  students: readonly CoachStudentDetail[],
  customerId: string,
): CoachStudentDetail | null {
  return students.find((student) => student.id === customerId) ?? null;
}
