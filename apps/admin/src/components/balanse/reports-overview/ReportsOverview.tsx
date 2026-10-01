"use client";

import { type AdminReports, formatPeso, formatRatioPercent, manilaYmd } from "@balanse/domain";
import { DateRangePicker } from "@balanse/ui";
import { DollarSignIcon, TrendingDownIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { useId, useMemo } from "react";
import { Badge } from "@/components/jabkit/badge";
import { cn } from "@/components/jabkit/lib/cn";
import type { ReportsOverviewProps } from "./ReportsOverview.meta";

type Tone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

const TONES: Tone[] = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];

const TONE_STROKE: Record<Tone, string> = {
  "chart-1": "var(--jk-chart-1)",
  "chart-2": "var(--jk-chart-2)",
  "chart-3": "var(--jk-chart-3)",
  "chart-4": "var(--jk-chart-4)",
  "chart-5": "var(--jk-chart-5)",
};

const TONE_ICON: Record<Tone, string> = {
  "chart-1": "bg-chart-1/15 text-chart-1",
  "chart-2": "bg-chart-2/15 text-chart-2",
  "chart-3": "bg-chart-3/15 text-chart-3",
  "chart-4": "bg-chart-4/15 text-chart-4",
  "chart-5": "bg-chart-5/15 text-chart-5",
};

const ALL_DATES = { from: "0001-01-01", to: "9999-12-31" };

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function areaPath(values: number[], width = 100, height = 42, pad = 3) {
  if (!values.length) return { line: "", area: "" };
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);
  const points = values.map((value, index) => {
    const x = index * step;
    const y = pad + (1 - (value - min) / span) * (height - pad * 2);
    return { x, y };
  });
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const last = points[points.length - 1];
  const area = `${line} L ${last.x} ${height} L 0 ${height} Z`;
  return { line, area };
}

function occupancyFromReports(reports: AdminReports) {
  const capacity = reports.sessionPerformance.reduce((sum, row) => sum + row.capacity, 0);
  const confirmed = reports.sessionPerformance.reduce((sum, row) => sum + row.confirmed, 0);
  return capacity ? confirmed / capacity : 0;
}

export function ReportsOverview({
  reports,
  from,
  to,
  onRangeChange,
  hideTitle = false,
}: ReportsOverviewProps) {
  const headingId = useId();
  const gradientId = useId();
  const rangeValue = from === ALL_DATES.from && to === ALL_DATES.to ? undefined : { from, to };

  const occupancy = occupancyFromReports(reports);
  const stats = [
    {
      id: "gross",
      label: "Gross Sales",
      value: formatPeso(reports.overview.grossSalesPhp),
      tone: "chart-1" as const,
      Icon: DollarSignIcon,
    },
    {
      id: "refunds",
      label: "Refunds",
      value: formatPeso(reports.overview.refundsPhp),
      tone: "chart-5" as const,
      Icon: TrendingDownIcon,
    },
    {
      id: "net",
      label: "Net Sales",
      value: formatPeso(reports.overview.netSalesPhp),
      tone: "chart-2" as const,
      Icon: TrendingUpIcon,
    },
    {
      id: "occupancy",
      label: "Occupancy",
      value: formatRatioPercent(occupancy),
      tone: "chart-3" as const,
      Icon: UsersIcon,
    },
  ];

  const series = useMemo(() => {
    const totals = new Map<string, number>();
    for (const row of reports.sessionPerformance) {
      const day = manilaYmd(row.startsAt);
      totals.set(day, (totals.get(day) ?? 0) + row.revenuePhp);
    }
    return [...totals.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }));
  }, [reports.sessionPerformance]);

  const classMix = useMemo(() => {
    const total = reports.classPerformance.reduce((sum, row) => sum + row.revenuePhp, 0) || 1;
    return reports.classPerformance
      .filter((row) => row.revenuePhp > 0)
      .map((row, index) => ({
        id: row.classId,
        label: row.className,
        value: (row.revenuePhp / total) * 100,
        tone: TONES[index % TONES.length],
      }));
  }, [reports.classPerformance]);

  const values = series.map((day) => day.revenue);
  const { line, area } = areaPath(values);
  const ticks = series.filter(
    (_, index) =>
      index === 0 || index === series.length - 1 || index === Math.floor((series.length - 1) / 2),
  );
  const mixTotal = classMix.reduce((sum, channel) => sum + channel.value, 0) || 1;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <section
      aria-labelledby={hideTitle ? undefined : headingId}
      aria-label={hideTitle ? "Reports" : undefined}
      className="bg-background text-foreground"
    >
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          {hideTitle ? null : (
            <h1 id={headingId} className="font-display text-3xl">
              Reports
            </h1>
          )}
          <p
            className={
              hideTitle
                ? "text-sm leading-6 text-muted-foreground"
                : "mt-2 text-sm leading-6 text-muted-foreground"
            }
          >
            Sales, occupancy, and class mix for the selected range.
          </p>
        </div>
        <DateRangePicker
          aria-label="Report date range"
          placeholder="All dates"
          className="w-full max-w-72 lg:w-72"
          value={rangeValue}
          onValueChange={(next) => onRangeChange(next ?? ALL_DATES)}
        />
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
        {stats.map((stat) => (
          <article key={stat.id} className="rounded-(--radius) border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn("grid size-9 place-items-center rounded-sm", TONE_ICON[stat.tone])}
              >
                <stat.Icon className="size-4" />
              </span>
              {stat.id === "refunds" ? (
                <Badge variant="outline">{reports.overview.paidBookings} paid</Badge>
              ) : null}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-12">
        <article className="flex min-h-80 flex-col rounded-(--radius) border border-border bg-card p-5 lg:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium">Gross Sales</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Daily take across the selected range
              </p>
            </div>
            <p className="font-mono text-sm text-muted-foreground">
              {formatPeso(reports.overview.grossSalesPhp)} total
            </p>
          </div>
          {values.length === 0 ? (
            <p className="mt-10 text-sm text-muted-foreground">No session sales in this range.</p>
          ) : (
            <>
              <svg
                viewBox="0 0 100 42"
                className="mt-6 h-44 w-full"
                preserveAspectRatio="none"
                role="img"
                aria-label={`Gross sales area chart totaling ${formatPeso(reports.overview.grossSalesPhp)}`}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--jk-chart-1)" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="var(--jk-chart-1)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill={`url(#${gradientId})`} />
                <path
                  d={line}
                  fill="none"
                  stroke="var(--jk-chart-1)"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="mt-3 flex justify-between font-mono text-[10px] text-muted-foreground">
                {ticks.map((day) => (
                  <span key={day.date}>{formatDay(day.date)}</span>
                ))}
              </div>
            </>
          )}
        </article>

        <article className="flex min-h-80 flex-col rounded-(--radius) border border-border bg-card p-5 lg:col-span-4">
          <div>
            <h2 className="text-sm font-medium">Class mix</h2>
            <p className="mt-1 text-xs text-muted-foreground">Revenue share for this window</p>
          </div>
          {classMix.length === 0 ? (
            <p className="mt-10 text-sm text-muted-foreground">No class mix in this range.</p>
          ) : (
            <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:items-center">
              <div className="relative size-40 shrink-0">
                <svg
                  viewBox="0 0 100 100"
                  className="size-full -rotate-90"
                  role="img"
                  aria-label="Class revenue mix"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="var(--jk-muted)"
                    strokeWidth="12"
                  />
                  {classMix.map((channel) => {
                    const length = (channel.value / mixTotal) * circumference;
                    const dashOffset = -offset;
                    offset += length;
                    return (
                      <circle
                        key={channel.id}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={TONE_STROKE[channel.tone]}
                        strokeWidth="12"
                        strokeDasharray={`${length} ${circumference - length}`}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="butt"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <p className="font-mono text-lg font-semibold tracking-tight">
                      {classMix.length}
                    </p>
                    <p className="text-[10px] text-muted-foreground">classes</p>
                  </div>
                </div>
              </div>
              <ul className="w-full min-w-0 space-y-2.5">
                {classMix.map((channel) => (
                  <li key={channel.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className="size-2.5 rounded-full"
                        style={{ background: TONE_STROKE[channel.tone] }}
                      />
                      <span className="truncate">{channel.label}</span>
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {Math.round(channel.value)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
