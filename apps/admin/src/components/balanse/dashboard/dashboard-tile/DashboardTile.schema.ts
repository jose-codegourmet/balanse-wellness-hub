import type * as React from "react";

export type DashboardTileSpan = "attention" | "schedule" | "stat" | "chart" | "metric";

export type DashboardTileProps = React.ComponentProps<"article"> & {
  span?: DashboardTileSpan;
  href?: string;
};
