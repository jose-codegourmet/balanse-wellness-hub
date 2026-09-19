import { describe, expect, it } from "vitest";
import { layoutTimedSessions, moveScheduleDate, scheduleGridDays } from "./calendar-layout";

describe("schedule calendar periods", () => {
  it("pages whole months, weeks, and days across year and leap-day boundaries", () => {
    expect(moveScheduleDate("2026-12-31", "month", 1)).toBe("2027-01-01");
    expect(moveScheduleDate("2024-03-01", "day", -1)).toBe("2024-02-29");
    expect(moveScheduleDate("2026-09-16", "week", -1)).toBe("2026-09-09");
    const days = scheduleGridDays("2026-09-16", "month");
    expect(days).toHaveLength(42);
    expect(days[0]).toBe("2026-08-31");
    expect(days[41]).toBe("2026-10-11");
    expect(scheduleGridDays("2026-09-20", "week")).toEqual([
      "2026-09-14",
      "2026-09-15",
      "2026-09-16",
      "2026-09-17",
      "2026-09-18",
      "2026-09-19",
      "2026-09-20",
    ]);
  });
});

describe("timed class placement", () => {
  const event = (id: string, start: string, end: string) => ({ id, startsAt: start, endsAt: end });
  it("uses Philippine hours even for UTC input and clips overnight classes", () => {
    const sessions = [event("overnight", "2026-09-15T15:30:00Z", "2026-09-15T16:30:00Z")];
    expect(layoutTimedSessions(sessions, "2026-09-15")[0]).toMatchObject({
      start: 1410,
      end: 1440,
    });
    expect(layoutTimedSessions(sessions, "2026-09-16")[0]).toMatchObject({ start: 0, end: 30 });
    expect(layoutTimedSessions(sessions, "2026-09-17")).toEqual([]);
  });
  it("separates overlapping classes and lets consecutive classes reuse a lane", () => {
    const sessions = [
      event("a", "2026-09-16T09:00:00+08:00", "2026-09-16T11:00:00+08:00"),
      event("b", "2026-09-16T09:30:00+08:00", "2026-09-16T10:00:00+08:00"),
      event("c", "2026-09-16T10:00:00+08:00", "2026-09-16T11:00:00+08:00"),
      event("d", "2026-09-16T11:00:00+08:00", "2026-09-16T12:00:00+08:00"),
    ];
    expect(
      layoutTimedSessions(sessions, "2026-09-16").map(({ column, columns }) => [column, columns]),
    ).toEqual([
      [0, 2],
      [1, 2],
      [1, 2],
      [0, 1],
    ]);
  });
});
