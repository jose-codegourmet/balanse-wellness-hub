/**
 * # InsightsBarChart (#354)
 *
 * One card on `/marketing-insights`: a horizontal bar chart of aggregate counts
 * (Jabkit `ChartContainer` + Recharts, the same stack as the dashboard sales
 * chart) with an accessible table fallback behind a "Show table" toggle.
 *
 * - `rows` are counts only — labels are option or class names, never people.
 * - `percentOf` adds a "% of …" column and bar labels (e.g. goal respondents).
 *   Omit it for lists where a share is misleading (class interests).
 * - `emptyLabel` replaces the chart when there is nothing to plot. Pass
 *   "No sign-ups in this range" when the range has no sign-ups, or a softer
 *   note when sign-ups exist but nobody answered this question.
 * - `children` render under the chart (e.g. the "Other" answers list).
 *
 * ## When not to use
 *
 * - Money or time series (use `SalesSeriesChart` / `ReportsOverview`).
 * - Anything that lists individual customers.
 */
import type { ReactNode } from "react";

export type InsightsBarRow = {
  key: string;
  label: string;
  count: number;
};

export type InsightsBarTone = 1 | 2 | 3 | 4 | 5;

export type InsightsBarChartProps = {
  /** Stable id for headings and the chart's accessible name. */
  id: string;
  title: string;
  description?: string;
  /** Muted note under the chart (e.g. "Multi-select: percentages don't add up to 100%"). */
  caption?: string;
  rows: InsightsBarRow[];
  /** Denominator for the percentage column. Omit to show counts only. */
  percentOf?: { total: number; label: string };
  /** Column header for the count in the table fallback. */
  countLabel?: string;
  /** When set, replaces the chart and table with this message. */
  emptyLabel?: string | null;
  /** Chart palette slot (`--chart-N`). */
  tone?: InsightsBarTone;
  children?: ReactNode;
};
