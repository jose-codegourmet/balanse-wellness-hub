"use client";

import { formatRatioPercent } from "@balanse/domain";
import { Button } from "@balanse/ui";
import { BarChart3Icon, TableIcon } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/jabkit/chart";
import type { InsightsBarChartProps } from "./InsightsBarChart.meta";

export type { InsightsBarChartProps, InsightsBarRow } from "./InsightsBarChart.meta";

const ROW_HEIGHT = 34;

function share(count: number, total: number): string {
  return total > 0 ? formatRatioPercent(count / total) : "0%";
}

export function InsightsBarChart({
  id,
  title,
  description,
  caption,
  rows,
  percentOf,
  countLabel = "Sign-ups",
  emptyLabel = null,
  tone = 1,
  children,
}: InsightsBarChartProps) {
  const [showTable, setShowTable] = useState(false);
  const headingId = `${id}-heading`;
  const chartConfig = {
    count: { label: countLabel, color: `var(--chart-${tone})` },
  } satisfies ChartConfig;
  const data = rows.map((row) => ({
    ...row,
    display: percentOf ? `${row.count} · ${share(row.count, percentOf.total)}` : String(row.count),
  }));
  const summary = rows
    .map((row) =>
      percentOf
        ? `${row.label}: ${row.count} (${share(row.count, percentOf.total)})`
        : `${row.label}: ${row.count}`,
    )
    .join("; ");

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col rounded-(--radius) border border-border bg-card p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={headingId} className="text-sm font-medium">
            {title}
          </h2>
          {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {emptyLabel ? null : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={showTable}
            onClick={() => setShowTable((value) => !value)}
          >
            {showTable ? <BarChart3Icon aria-hidden /> : <TableIcon aria-hidden />}
            {showTable ? "Show chart" : "Show table"}
          </Button>
        )}
      </header>

      {emptyLabel ? (
        <p className="mt-6 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : showTable ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-medium">
                  Answer
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">
                  {countLabel}
                </th>
                {percentOf ? (
                  <th scope="col" className="py-2 text-right font-medium">
                    % of {percentOf.label}
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-border/60 last:border-b-0">
                  <th scope="row" className="py-2 pr-3 text-left font-normal">
                    {row.label}
                  </th>
                  <td className="py-2 pr-3 text-right tabular-nums">{row.count}</td>
                  {percentOf ? (
                    <td className="py-2 text-right tabular-nums">
                      {share(row.count, percentOf.total)}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="mt-4 aspect-auto w-full"
          style={{ height: Math.max(rows.length, 1) * ROW_HEIGHT + 8 }}
          role="img"
          aria-label={`${title}. ${summary}`}
        >
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 56, top: 4, bottom: 4 }}
          >
            <XAxis type="number" dataKey="count" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={150}
              interval={0}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="count" labelKey="label" hideIndicator />}
            />
            <Bar dataKey="count" name="count" fill="var(--color-count)" radius={4} barSize={18}>
              <LabelList
                dataKey="display"
                position="right"
                className="fill-muted-foreground tabular-nums"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}

      {caption && !emptyLabel ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{caption}</p>
      ) : null}
      {emptyLabel ? null : children}
    </section>
  );
}
