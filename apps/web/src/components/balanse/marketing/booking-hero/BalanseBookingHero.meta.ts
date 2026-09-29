import type { PublicClass, PublicCoach, PublicSession } from "@balanse/domain";

/** Shared booking hero for the homepage and dedicated public booking routes.
 * Omit bookingMode on the homepage to switch modes in place. Set it on
 * /book/quick or /book/calendar to lock the view and use route links between modes.
 * Receives mock schedule data from the route; reservation/auth handling stays in
 * ScheduleCalendarSection. Never use the customer-only schedule audience here.
 */
export type BalanseBookingHeroProps = {
  sessions: PublicSession[];
  classes: PublicClass[];
  coaches: PublicCoach[];
  loadError: boolean;
  coachId: string;
  classId: string;
  bookingMode?: "quick" | "calendar";
};
