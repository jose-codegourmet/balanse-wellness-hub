import type { AdminScheduleCalendarProps } from "./AdminScheduleCalendar.meta";

export const adminScheduleCalendarDefaultValues: Partial<AdminScheduleCalendarProps> = {
  sessions: [],
  todayYmd: "2026-09-16",
  anchorDay: "2026-09-16",
  selectedDay: null,
  selectedSessionId: null,
  view: "auto",
  loading: false,
};
