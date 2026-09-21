import type { AdminScheduleCalendarProps } from "./AdminScheduleCalendar.schema";

export const adminScheduleCalendarDefaultValues: Partial<AdminScheduleCalendarProps> = {
  sessions: [],
  todayYmd: "2026-09-16",
  selectedDay: "2026-09-16",
  selectedSessionId: null,
  view: "auto",
  loading: false,
};
