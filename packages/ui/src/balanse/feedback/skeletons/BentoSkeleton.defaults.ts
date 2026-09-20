import type { BentoSkeletonProps, BentoSkeletonTileSpec } from "./BentoSkeleton.schema";

/** Matches admin `dashboardTileSpanClass` / `dashboardBentoSkeletonTiles`. */
export const bentoSkeletonDashboardTiles: BentoSkeletonTileSpec[] = [
  {
    id: "attention",
    span: "col-span-1 min-h-72 md:col-span-6 xl:col-span-7 xl:row-span-2",
    variant: "block",
  },
  {
    id: "schedule",
    span: "col-span-1 min-h-80 md:col-span-6 xl:col-span-7 xl:row-span-2",
    variant: "table",
  },
  { id: "stat-classes", span: "col-span-1 md:col-span-2 xl:col-span-5", variant: "stat" },
  { id: "stat-payments", span: "col-span-1 md:col-span-2 xl:col-span-5", variant: "stat" },
  { id: "stat-cancellations", span: "col-span-1 md:col-span-2 xl:col-span-5", variant: "stat" },
  { id: "stat-reschedules", span: "col-span-1 md:col-span-2 xl:col-span-5", variant: "stat" },
  { id: "stat-waitlisted", span: "col-span-1 md:col-span-2 xl:col-span-5", variant: "stat" },
  { id: "chart", span: "col-span-1 min-h-56 md:col-span-6 xl:col-span-7", variant: "chart" },
  { id: "metric-sales", span: "col-span-1 md:col-span-3 xl:col-span-3", variant: "stat" },
  { id: "metric-refunds", span: "col-span-1 md:col-span-3 xl:col-span-3", variant: "stat" },
  { id: "metric-occupancy", span: "col-span-1 md:col-span-3 xl:col-span-3", variant: "stat" },
  { id: "coach-cost", span: "col-span-1 md:col-span-3 xl:col-span-3", variant: "stat" },
];

export const bentoSkeletonDefaultValues: BentoSkeletonProps = {
  label: "Loading dashboard",
  tiles: bentoSkeletonDashboardTiles,
};
