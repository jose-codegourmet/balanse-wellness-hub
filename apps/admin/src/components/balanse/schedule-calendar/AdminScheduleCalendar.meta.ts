import type { AdminSession } from "@balanse/domain";
import type { ReactNode } from "react";

export const adminScheduleCalendarMeta = {
  purpose:
    "Full-height admin schedule calendar (month, week, day). Every day box and every session in it is clickable, so the page can open its day sidebar.",
  whenToUse:
    "The /schedule page. The page owns which day/session is open and renders the sidebar; the calendar only reports clicks and navigation.",
  whenNotToUse:
    "Not for customer booking (apps/web has BalanseBookingCalendar). Does not edit sessions itself.",
} as const;

export type AdminCalendarView = "day" | "week" | "month";

export type AdminScheduleCalendarView = AdminCalendarView | "auto";

export type AdminScheduleCalendarProps = {
  sessions: AdminSession[];
  todayYmd: string;
  /** The date whose month / week / day is on screen. */
  anchorDay: string;
  /** The day open in the page sidebar, highlighted in the grid. */
  selectedDay?: string | null;
  /** The session open in the page sidebar, highlighted in the grid. */
  selectedSessionId?: string | null;
  view?: AdminScheduleCalendarView;
  onViewChange?: (view: AdminCalendarView) => void;
  /** Today / previous / next. Moves the anchor without opening anything. */
  onNavigate: (ymd: string) => void;
  /** A day box (or its "+N more") was clicked. */
  onOpenDay: (ymd: string) => void;
  /** A session in the grid was clicked. */
  onOpenSession: (session: AdminSession) => void;
  /**
   * Venue name to show on a session, or null to hide it. The schedule shows it for
   * off-site sessions (and every session once there is more than one branch).
   */
  venueLabel?: (session: AdminSession) => string | null;
  /** Page actions rendered at the end of the toolbar (Tools, New session). */
  actions?: ReactNode;
  loading?: boolean;
  className?: string;
};
