"use client";

import { type AdminReports, formatPeso, formatRatioPercent, manilaYmd } from "@balanse/domain";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DollarSignIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Badge } from "@/components/jabkit/badge";
import { Button } from "@/components/jabkit/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/jabkit/dialog/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/jabkit/dropdown-menu/DropdownMenu";
import { cn } from "@/components/jabkit/lib/cn";

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

const PRESETS = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
] as const;

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const REFERENCE_DATE = "2026-09-30";

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function shiftMonth(iso: string, months: number) {
  const date = new Date(`${iso.slice(0, 8)}01T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatRangeLabel(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate = new Date(`${end}T00:00:00.000Z`);
  const sameYear = startDate.getUTCFullYear() === endDate.getUTCFullYear();
  const left = startDate.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
    timeZone: "UTC",
  });
  const right = endDate.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${left} – ${right}`;
}

function formatMonthTitle(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
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

function monthCells(monthIso: string) {
  const first = new Date(`${monthIso.slice(0, 8)}01T00:00:00.000Z`);
  const year = first.getUTCFullYear();
  const month = first.getUTCMonth();
  const startWeekday = first.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<{ key: string; iso: string | null; label: number | null }> = [];
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ key: `${year}-${month}-pad-${i}`, iso: null, label: null });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ key: iso, iso, label: day });
  }
  return cells;
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
}: {
  reports: AdminReports;
  from: string;
  to: string;
  onRangeChange: (next: { from: string; to: string }) => void;
}) {
  const headingId = useId();
  const gradientId = useId();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(`${to.slice(0, 8)}01`);
  const [draftStart, setDraftStart] = useState(from);
  const [draftEnd, setDraftEnd] = useState(to);
  const [picking, setPicking] = useState<"start" | "end">("start");

  const activePreset = PRESETS.find((preset) => {
    const start = addDays(REFERENCE_DATE, -(preset.days - 1));
    return from === start && to === REFERENCE_DATE;
  });

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
    return reports.classPerformance.slice(0, 5).map((row, index) => ({
      id: row.classId,
      label: row.className,
      value: Math.round((row.revenuePhp / total) * 100),
      tone: TONES[index % TONES.length],
    }));
  }, [reports.classPerformance]);

  const applyPreset = (id: string) => {
    const preset = PRESETS.find((item) => item.id === id);
    if (!preset) return;
    onRangeChange({
      from: addDays(REFERENCE_DATE, -(preset.days - 1)),
      to: REFERENCE_DATE,
    });
  };

  const openCalendar = (open: boolean) => {
    setCalendarOpen(open);
    if (open) {
      setDraftStart(from);
      setDraftEnd(to);
      setViewMonth(`${to.slice(0, 8)}01`);
      setPicking("start");
    }
  };

  const pickDay = (iso: string) => {
    if (picking === "start") {
      setDraftStart(iso);
      setDraftEnd(iso);
      setPicking("end");
      return;
    }
    if (iso < draftStart) {
      setDraftEnd(draftStart);
      setDraftStart(iso);
    } else {
      setDraftEnd(iso);
    }
    setPicking("start");
  };

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
    <section aria-labelledby={headingId} className="bg-background text-foreground">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <h1 id={headingId} className="font-display text-3xl">
            Reports
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Sales, occupancy, and class mix for the selected range.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {activePreset?.label ?? "Custom range"} · {formatRangeLabel(from, to)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="secondary" size="sm" className="min-w-40 justify-between gap-2">
                  {activePreset?.label ?? "Custom range"}
                  <ChevronDownIcon className="size-4 opacity-70" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-44">
              {PRESETS.map((preset) => (
                <DropdownMenuItem key={preset.id} onClick={() => applyPreset(preset.id)}>
                  {preset.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={calendarOpen} onOpenChange={openCalendar}>
            <DialogTrigger
              render={
                <Button variant="secondary" size="sm" className="gap-2">
                  <CalendarIcon className="size-4" />
                  <span className="hidden sm:inline">{formatRangeLabel(from, to)}</span>
                  <span className="sm:hidden">Range</span>
                </Button>
              }
            />
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Custom range</DialogTitle>
                <DialogDescription>Pick a start day, then an end day.</DialogDescription>
              </DialogHeader>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    className="grid size-8 place-items-center rounded-md hover:bg-muted"
                    aria-label="Previous month"
                    onClick={() => setViewMonth(shiftMonth(viewMonth, -1))}
                  >
                    <ChevronLeftIcon className="size-4" />
                  </button>
                  <p className="text-sm font-medium">{formatMonthTitle(viewMonth)}</p>
                  <button
                    type="button"
                    className="grid size-8 place-items-center rounded-md hover:bg-muted"
                    aria-label="Next month"
                    onClick={() => setViewMonth(shiftMonth(viewMonth, 1))}
                  >
                    <ChevronRightIcon className="size-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
                  {WEEKDAYS.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                  {monthCells(viewMonth).map((cell) =>
                    cell.iso ? (
                      <button
                        key={cell.key}
                        type="button"
                        onClick={() => pickDay(cell.iso as string)}
                        className={cn(
                          "grid size-8 place-items-center rounded-md text-xs",
                          cell.iso >= (draftStart <= draftEnd ? draftStart : draftEnd) &&
                            cell.iso <= (draftStart <= draftEnd ? draftEnd : draftStart)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted",
                        )}
                      >
                        {cell.label}
                      </button>
                    ) : (
                      <span key={cell.key} />
                    ),
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatRangeLabel(draftStart, draftEnd)}
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCalendarOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const start = draftStart <= draftEnd ? draftStart : draftEnd;
                    const end = draftStart <= draftEnd ? draftEnd : draftStart;
                    onRangeChange({ from: start, to: end });
                    setCalendarOpen(false);
                  }}
                >
                  Apply range
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
        {stats.map((stat) => (
          <article key={stat.id} className="rounded-[--radius] border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-[calc(var(--radius)-0.35rem)]",
                  TONE_ICON[stat.tone],
                )}
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
        <article className="flex min-h-80 flex-col rounded-[--radius] border border-border bg-card p-5 lg:col-span-8">
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

        <article className="flex min-h-80 flex-col rounded-[--radius] border border-border bg-card p-5 lg:col-span-4">
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
                    <p className="font-mono text-lg font-semibold tracking-tight">{mixTotal}</p>
                    <p className="text-[10px] text-muted-foreground">share pts</p>
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
                      {channel.value}%
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
