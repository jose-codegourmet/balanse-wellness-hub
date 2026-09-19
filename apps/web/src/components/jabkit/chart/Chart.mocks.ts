import type { ChartConfig } from "./Chart.types";

export const chartMocks = {
  default: {
    title: "Bar Chart",
    description: "January - June 2024",
    trend: "Trending up by 5.2% this month",
    footer: "Showing total visitors for the last 6 months",
    data: [
      { month: "January", desktop: 186 },
      { month: "February", desktop: 305 },
      { month: "March", desktop: 237 },
      { month: "April", desktop: 73 },
      { month: "May", desktop: 209 },
      { month: "June", desktop: 214 },
    ],
    config: {
      desktop: {
        label: "Desktop",
        color: "var(--color-chart-1)",
      },
    } satisfies ChartConfig,
  },
  multiple: {
    title: "Bar Chart - Multiple",
    description: "January - June 2024",
    trend: "Trending up by 5.2% this month",
    footer: "Showing total visitors for the last 6 months",
    data: [
      { month: "January", desktop: 186, mobile: 80 },
      { month: "February", desktop: 305, mobile: 200 },
      { month: "March", desktop: 237, mobile: 120 },
      { month: "April", desktop: 73, mobile: 190 },
      { month: "May", desktop: 209, mobile: 130 },
      { month: "June", desktop: 214, mobile: 140 },
    ],
    config: {
      desktop: {
        label: "Desktop",
        color: "var(--color-chart-1)",
      },
      mobile: {
        label: "Mobile",
        color: "var(--color-chart-2)",
      },
    } satisfies ChartConfig,
  },
} as const;
