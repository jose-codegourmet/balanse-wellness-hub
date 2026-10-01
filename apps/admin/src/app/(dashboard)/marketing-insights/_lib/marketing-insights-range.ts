import { addManilaDays } from "@balanse/domain";
import { adminTodayYmd } from "@/lib/clock";

/** Default window: the last 90 Manila days, ending on the frozen admin "today". */
export const MARKETING_INSIGHTS_DEFAULT_DAYS = 90;

/** Cleared picker → every sign-up date (mirrors ReportsOverview's "All dates"). */
export const MARKETING_INSIGHTS_ALL_DATES = { from: "0001-01-01", to: "9999-12-31" } as const;

export function defaultMarketingInsightsRange(today = adminTodayYmd()) {
  return { from: addManilaDays(today, -(MARKETING_INSIGHTS_DEFAULT_DAYS - 1)), to: today };
}

export function isAllDatesRange(range: { from: string; to: string }): boolean {
  return (
    range.from === MARKETING_INSIGHTS_ALL_DATES.from && range.to === MARKETING_INSIGHTS_ALL_DATES.to
  );
}
