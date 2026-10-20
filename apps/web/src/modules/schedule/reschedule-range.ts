import { addManilaDays, manilaYmd } from "@balanse/domain";

/** Customers may ask to move into the next eight weeks of sessions (#379). */
export const RESCHEDULE_WINDOW_DAYS = 56;

function manilaDayStart(ymd: string): string {
  return new Date(`${ymd}T00:00:00.000+08:00`).toISOString();
}

/**
 * Rolling `/api/public/sessions` window for the reschedule picker: the start
 * of today in Asia/Manila through the start of the day eight weeks out, as UTC
 * instants. Day-aligned so the query key is stable for a whole studio day and
 * the server prefetch and the client query share one cache entry. Unlike
 * `SHOWCASE_SCHEDULE_RANGE` this follows the clock, not the fixture year.
 * No `server-only` marker: used by `reschedule/page.tsx` and `RescheduleForm`.
 */
export function rescheduleRange(nowIso: string): { from: string; to: string } {
  const today = manilaYmd(nowIso);
  return {
    from: manilaDayStart(today),
    to: manilaDayStart(addManilaDays(today, RESCHEDULE_WINDOW_DAYS)),
  };
}
