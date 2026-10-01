/**
 * # MarketingInsightsPage (#354)
 *
 * Super Admin's aggregate view of who signs up and why, at `/marketing-insights`
 * (Studio nav, after Reports). Gated on `reports.marketing.read`; the route
 * renders the shared `AccessDenied` state without it, and the adapter refuses
 * the query anyway.
 *
 * - Date range on **sign-up date** (shared `DateRangePicker`, Manila days),
 *   defaulting to the last 90 days ending on the admin mock "today".
 *   Clearing the picker selects every sign-up date.
 * - KPI tiles: sign-ups, onboarding completed %, skipped %, not started %
 *   (in-progress noted beneath), sign-ups from shared links (count · %).
 * - Cards (`InsightsBarChart`): how they heard about us (+ expandable "Other"
 *   answers, lowercased, top 20), goals (% of respondents, multi-select
 *   caption), experience level, class interest ("(inactive)" suffix), and
 *   sharing by referral channel with an `InsightsShareSplit` bar for customer
 *   referrals vs studio marketing.
 * - Every card has an empty state and a "Show table" fallback.
 *
 * **Counts only.** No customer names, emails or ids are rendered; the
 * adapter returns none.
 *
 * ## When not to use
 *
 * - Sales, occupancy, or coach-cost reporting (`/sales`, `/reports`).
 * - Anything that needs per-customer rows (customers directory).
 */
export type MarketingInsightsPageProps = {
  /** Manila `YYYY-MM-DD` range. Defaults to the last 90 days. Stories pass empty ranges. */
  initialRange?: { from: string; to: string };
};
