"use client";

import { formatPeso, manilaYmdToUtcDate, REPORT_TERMS } from "@balanse/domain";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/jabkit/chart";
import { DashboardTile } from "../dashboard-tile/DashboardTile";
import type { SalesSeriesChartProps } from "./SalesSeriesChart.meta";

const chartConfig = {
  sales: {
    label: "Gross sales",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function formatSeriesDay(ymd: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(manilaYmdToUtcDate(ymd));
}

export function SalesSeriesChart({ series }: SalesSeriesChartProps) {
  const rows = series.points.map((point) => ({
    date: point.date,
    label: formatSeriesDay(point.date),
    sales: point.value,
  }));
  const total = series.points.reduce((sum, point) => sum + point.value, 0);
  const summary = rows.map((row) => `${row.label}: ${formatPeso(row.sales)}`).join("; ");

  return (
    <DashboardTile span="chart" aria-labelledby="gross-sales-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="gross-sales-heading" className="text-sm font-medium">
            {REPORT_TERMS[0]}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Paid bookings by Manila session day. Zero is a real empty day, not a placeholder.
          </p>
        </div>
      </div>
      <ChartContainer
        config={chartConfig}
        className="mt-4 aspect-auto h-44 w-full"
        aria-label={`Gross sales over ${series.windowDays} Manila days totaling ${formatPeso(total)}. ${summary}`}
      >
        <AreaChart accessibilityLayer data={rows}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(value: number) => formatPeso(value)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent nameKey="sales" labelKey="label" />}
          />
          <Area
            type="monotone"
            dataKey="sales"
            name="sales"
            stroke="var(--color-sales)"
            fill="var(--color-sales)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
      <ol className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3">
        {rows.map((row) => (
          <li key={row.date} className="flex justify-between gap-2 tabular-nums">
            <span>{row.label}</span>
            <span>{formatPeso(row.sales)}</span>
          </li>
        ))}
      </ol>
    </DashboardTile>
  );
}
