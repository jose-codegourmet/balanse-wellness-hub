import type { HTMLAttributes } from "react";

export interface FullscreenCalendarEvent {
  id: string;
  name: string;
  time: string;
}

export interface FullscreenCalendarDay {
  day: Date;
  events: FullscreenCalendarEvent[];
}

export interface FullscreenCalendarProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  data?: FullscreenCalendarDay[];
  today?: Date;
  defaultMonth?: Date;
  defaultSelectedDay?: Date;
  todayLabel?: string;
  addEventLabel?: string;
  weekdayLabels?: string[];
  onSelectDay?: (day: Date) => void;
  onMonthChange?: (month: Date) => void;
  onAddEvent?: (day: Date) => void;
}
