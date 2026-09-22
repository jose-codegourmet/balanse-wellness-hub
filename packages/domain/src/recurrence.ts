import type { SessionStatus } from "./enums";

export const WEEKDAYS = [
  { value: 1, shortLabel: "Mon", label: "Monday" },
  { value: 2, shortLabel: "Tue", label: "Tuesday" },
  { value: 3, shortLabel: "Wed", label: "Wednesday" },
  { value: 4, shortLabel: "Thu", label: "Thursday" },
  { value: 5, shortLabel: "Fri", label: "Friday" },
  { value: 6, shortLabel: "Sat", label: "Saturday" },
  { value: 0, shortLabel: "Sun", label: "Sunday" },
] as const;

export type Weekday = (typeof WEEKDAYS)[number]["value"];

export type DuplicateScheduleInput = {
  sourceStart: string;
  sourceEnd: string;
  targetStart: string;
  publish: boolean;
};

export type RecurringScheduleInput = {
  sourceSessionId: string;
  startsOn: string;
  endsOn: string;
  weekdays: Weekday[];
  publish: boolean;
};

export type ScheduleGenerationResult = {
  createdCount: number;
  skippedCount: number;
  sessionIds: string[];
  recurrenceRuleId?: string;
};

export type RecurrenceSummary = {
  id: string;
  sourceSessionId: string;
  startsOn: string;
  endsOn: string;
  weekdays: Weekday[];
  status: Exclude<SessionStatus, "CANCELLED">;
  timeZone: "Asia/Manila";
};

const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseYmd(ymd: string): Date {
  if (!YMD_PATTERN.test(ymd)) throw new Error("Use a valid yyyy-mm-dd date.");
  const date = new Date(`${ymd}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== ymd) {
    throw new Error("Use a valid yyyy-mm-dd date.");
  }
  return date;
}

export function addCalendarDays(ymd: string, days: number): string {
  const date = parseYmd(ymd);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function calendarDayDistance(fromYmd: string, toYmd: string): number {
  return Math.round((parseYmd(toYmd).getTime() - parseYmd(fromYmd).getTime()) / 86_400_000);
}

export function weekdayForYmd(ymd: string): Weekday {
  return parseYmd(ymd).getUTCDay() as Weekday;
}

export function datesForWeeklyRecurrence(input: {
  startsOn: string;
  endsOn: string;
  weekdays: readonly Weekday[];
}): string[] {
  const distance = calendarDayDistance(input.startsOn, input.endsOn);
  if (distance < 0) return [];
  const selected = new Set(input.weekdays);
  return Array.from({ length: distance + 1 }, (_, index) =>
    addCalendarDays(input.startsOn, index),
  ).filter((ymd) => selected.has(weekdayForYmd(ymd)));
}

export function shiftSessionIsoToDate(iso: string, ymd: string): string {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
  return `${ymd}T${time}+08:00`;
}
