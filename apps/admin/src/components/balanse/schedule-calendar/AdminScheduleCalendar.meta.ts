import type { AdminSession } from "@balanse/domain";

export type AdminCalendarView = "day" | "week" | "month";

export type AdminScheduleCalendarView = AdminCalendarView | "auto";

export type AdminScheduleCalendarProps = {
  sessions: AdminSession[];
  todayYmd: string;
  selectedDay: string;
  selectedSessionId?: string | null;
  view?: AdminScheduleCalendarView;
  onViewChange?: (view: AdminCalendarView) => void;
  onSelectDay: (ymd: string) => void;
  onSelectSession: (sessionId: string | null) => void;
  onCreateSession?: (ymd: string) => void;
  loading?: boolean;
  className?: string;
};
