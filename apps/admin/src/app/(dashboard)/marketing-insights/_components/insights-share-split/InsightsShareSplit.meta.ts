/**
 * # InsightsShareSplit (#354)
 *
 * A single segmented bar under the Sharing chart on `/marketing-insights`:
 * the share of sign-ups that came from customer referrals (customer link or
 * QR), studio marketing (studio link or QR), or no shared link. The legend
 * is a plain list with counts and percentages, so it doubles as the
 * accessible text alternative; the bar itself is `role="img"` with a summary.
 *
 * Counts only. Renders nothing meaningful when `total` is 0 — the parent
 * shows the "No sign-ups in this range" empty state instead.
 */
export type InsightsShareSegment = {
  key: "customer" | "studio" | "none";
  label: string;
  count: number;
};

export type InsightsShareSplitProps = {
  segments: InsightsShareSegment[];
  /** Sign-ups in range; the denominator for every segment. */
  total: number;
};
