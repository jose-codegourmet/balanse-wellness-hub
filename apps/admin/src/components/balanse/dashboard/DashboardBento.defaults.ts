import type { BentoSkeletonTileSpec } from "@balanse/ui";
import type { DashboardBentoProps } from "./DashboardBento.schema";
import { dashboardTileSpanClass } from "./DashboardTile.defaults";

export const dashboardBentoDefaultValues: Partial<DashboardBentoProps> = {
  className: "w-full",
};

/** Skeleton tiles that mirror the live dashboard 12/6/1 spans. */
export const dashboardBentoSkeletonTiles: BentoSkeletonTileSpec[] = [
  { id: "attention", span: dashboardTileSpanClass.attention, variant: "block" },
  { id: "schedule", span: dashboardTileSpanClass.schedule, variant: "table" },
  { id: "stat-classes", span: dashboardTileSpanClass.stat, variant: "stat" },
  { id: "stat-payments", span: dashboardTileSpanClass.stat, variant: "stat" },
  { id: "stat-cancellations", span: dashboardTileSpanClass.stat, variant: "stat" },
  { id: "stat-reschedules", span: dashboardTileSpanClass.stat, variant: "stat" },
  { id: "stat-waitlisted", span: dashboardTileSpanClass.stat, variant: "stat" },
  { id: "chart", span: dashboardTileSpanClass.chart, variant: "chart" },
  { id: "metric-sales", span: dashboardTileSpanClass.metric, variant: "stat" },
  { id: "metric-refunds", span: dashboardTileSpanClass.metric, variant: "stat" },
  { id: "metric-occupancy", span: dashboardTileSpanClass.metric, variant: "stat" },
  { id: "coach-cost", span: dashboardTileSpanClass.metric, variant: "stat" },
];

export function dashboardSkeletonTilesForRole(
  canViewCoachCost: boolean,
): BentoSkeletonTileSpec[] {
  if (canViewCoachCost) return dashboardBentoSkeletonTiles;
  return dashboardBentoSkeletonTiles.filter((tile) => tile.id !== "coach-cost");
}
