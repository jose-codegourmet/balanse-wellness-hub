/**
 * Coach-only detail of one student from the signed-in coach's own classes
 * (`/students/[customerId]`). Header: `UserAvatar` (`xl`), full name, and
 * "Goes by <nickname>". Stats: sessions attended, contribution, next booking.
 * An About card (shared `CustomerAboutCard`, no heard-from) shows goals,
 * experience and interests (#353) — the coach-scoped adapter returns answers
 * only for the coach's own students. No referral card and no contact changes.
 * Then upcoming classes and attendance history.
 */
export type CoachStudentDetailPageProps = {
  customerId: string;
};
