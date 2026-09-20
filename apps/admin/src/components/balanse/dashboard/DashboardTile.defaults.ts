import type { DashboardTileProps, DashboardTileSpan } from "./DashboardTile.schema";

export const dashboardTileSpanClass: Record<DashboardTileSpan, string> = {
  attention: "col-span-1 min-h-72 md:col-span-6 xl:col-span-7 xl:row-span-2",
  schedule: "col-span-1 min-h-80 md:col-span-6 xl:col-span-7 xl:row-span-2",
  stat: "col-span-1 md:col-span-2 xl:col-span-5",
  chart: "col-span-1 min-h-56 md:col-span-6 xl:col-span-7",
  metric: "col-span-1 md:col-span-3 xl:col-span-3",
};

export const dashboardTileDefaultValues: Partial<DashboardTileProps> = {
  span: "stat",
};
