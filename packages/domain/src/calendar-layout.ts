import { addManilaDays, manilaYmdToUtcDate, startOfManilaWeekMonday } from "./format";

export type ScheduleGridView = "month" | "week" | "day";

/** Calendar paging uses business dates, never the browser's local timezone. */
export function moveScheduleDate(ymd: string, view: ScheduleGridView, direction: number): string {
  if (view !== "month") return addManilaDays(ymd, direction * (view === "week" ? 7 : 1));
  const date = manilaYmdToUtcDate(`${ymd.slice(0, 7)}-01`);
  date.setUTCMonth(date.getUTCMonth() + direction);
  return date.toISOString().slice(0, 10);
}

export function scheduleGridDays(ymd: string, view: ScheduleGridView): string[] {
  if (view === "day") return [ymd];
  const start = startOfManilaWeekMonday(view === "month" ? `${ymd.slice(0, 7)}-01` : ymd);
  return Array.from({ length: view === "month" ? 42 : 7 }, (_, index) =>
    addManilaDays(start, index),
  );
}

export type TimedCalendarEntry = {
  id: string;
  start: number;
  end: number;
  column: number;
  columns: number;
};

/** Split overnight events at Manila midnight and give simultaneous classes separate lanes. */
export function layoutTimedSessions(
  sessions: readonly { id: string; startsAt: string; endsAt: string }[],
  day: string,
): TimedCalendarEntry[] {
  const midnight = new Date(`${day}T00:00:00+08:00`).getTime();
  const entries = sessions
    .map((session) => ({
      id: session.id,
      start: Math.max(0, (new Date(session.startsAt).getTime() - midnight) / 60_000),
      end: Math.min(1440, (new Date(session.endsAt).getTime() - midnight) / 60_000),
      column: 0,
      columns: 1,
    }))
    .filter((entry) => entry.end > entry.start)
    .sort((a, b) => a.start - b.start || b.end - a.end || a.id.localeCompare(b.id));

  let group: TimedCalendarEntry[] = [];
  let ends: number[] = [];
  let groupEnd = 0;
  const finish = () => {
    for (const entry of group) entry.columns = ends.length;
  };
  for (const entry of entries) {
    if (entry.start >= groupEnd) {
      finish();
      group = [];
      ends = [];
    }
    let lane = ends.findIndex((end) => end <= entry.start);
    if (lane === -1) lane = ends.length;
    entry.column = lane;
    ends[lane] = entry.end;
    group.push(entry);
    groupEnd = Math.max(...ends);
  }
  finish();
  return entries;
}
