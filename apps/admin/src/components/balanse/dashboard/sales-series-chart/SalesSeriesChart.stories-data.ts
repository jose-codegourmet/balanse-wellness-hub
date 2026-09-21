import { adminSessions, bookings, deriveGrossSalesSeries } from "@balanse/mock";
import type { SalesSeriesChartProps } from "./SalesSeriesChart.meta";

export const salesSeriesChartDefaultValues: SalesSeriesChartProps = {
  series: deriveGrossSalesSeries(adminSessions, bookings, "2026-09-16"),
};
