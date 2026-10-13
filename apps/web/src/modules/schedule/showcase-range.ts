/**
 * The showcase schedule runs on fixed Sept–Oct 2026 dates, not relative to
 * today (decision 8, WIRE-0412 / #361) — `/api/public/sessions` requires an
 * explicit `from`/`to` window, so this covers the whole fixture year rather
 * than a rolling "next N days" range. No `server-only` marker: shared by
 * `load-schedule.ts` (server) and `ScheduleCalendarSection.tsx` (client).
 */
export const SHOWCASE_SCHEDULE_RANGE = {
  from: "2026-01-01T00:00:00.000Z",
  to: "2027-01-01T00:00:00.000Z",
};
