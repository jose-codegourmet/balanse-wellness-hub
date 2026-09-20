import type { AdminSession, CustomerBooking, MetricSeries } from "@balanse/domain";
import {
  addManilaDays,
  countsTowardGrossSales,
  DASHBOARD_SERIES_WINDOW_DAYS,
  manilaYmd,
} from "@balanse/domain";

/** Trailing Manila-day gross sales from existing paid bookings. Empty days stay 0. */
export function deriveGrossSalesSeries(
  sessions: AdminSession[],
  bookings: CustomerBooking[],
  todayYmd: string,
): MetricSeries {
  const windowDays = DASHBOARD_SERIES_WINDOW_DAYS;
  const start = addManilaDays(todayYmd, -(windowDays - 1));
  const knownSessionIds = new Set(sessions.map((session) => session.id));
  const totals = new Map<string, number>();
  for (let offset = 0; offset < windowDays; offset += 1) {
    totals.set(addManilaDays(start, offset), 0);
  }

  for (const booking of bookings) {
    if (!countsTowardGrossSales(booking)) continue;
    if (knownSessionIds.size > 0 && !knownSessionIds.has(booking.sessionId)) continue;
    const day = manilaYmd(booking.session.startsAt);
    if (!totals.has(day)) continue;
    totals.set(day, (totals.get(day) ?? 0) + booking.session.pricePhp);
  }

  return {
    metric: "gross_sales",
    grain: "day",
    timezone: "Asia/Manila",
    windowDays,
    points: [...totals.entries()].map(([date, value]) => ({ date, value })),
  };
}
