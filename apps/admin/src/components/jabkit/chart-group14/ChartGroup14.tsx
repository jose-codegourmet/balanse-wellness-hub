"use client";

import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DollarSignIcon,
  MousePointerClickIcon,
  TrendingDownIcon,
  UsersIcon,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/jabkit/avatar/Avatar";
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
import type {
  ChartGroup14Channel,
  ChartGroup14Day,
  ChartGroup14Page,
  ChartGroup14Person,
  ChartGroup14Preset,
  ChartGroup14Props,
  ChartGroup14Tone,
} from "./ChartGroup14.types";

const DEFAULT_TITLE = "Analytics";
const DEFAULT_DESCRIPTION =
  "Revenue, traffic, and the pages that are carrying the week. Change the range and the board follows.";
const DEFAULT_REFERENCE = "2026-09-05";
const DEFAULT_PAGES_HREF = "#pages";
const DEFAULT_PEOPLE_HREF = "#people";

const DEFAULT_PRESETS: ChartGroup14Preset[] = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const TONE_STROKE: Record<ChartGroup14Tone, string> = {
  "chart-1": "var(--jk-chart-1)",
  "chart-2": "var(--jk-chart-2)",
  "chart-3": "var(--jk-chart-3)",
  "chart-4": "var(--jk-chart-4)",
  "chart-5": "var(--jk-chart-5)",
};

const TONE_ICON: Record<ChartGroup14Tone, string> = {
  "chart-1": "bg-chart-1/15 text-chart-1",
  "chart-2": "bg-chart-2/15 text-chart-2",
  "chart-3": "bg-chart-3/15 text-chart-3",
  "chart-4": "bg-chart-4/15 text-chart-4",
  "chart-5": "bg-chart-5/15 text-chart-5",
};

const DEFAULT_CHANNELS: ChartGroup14Channel[] = [
  { id: "direct", label: "Direct", value: 38, tone: "chart-1" },
  { id: "organic", label: "Organic search", value: 27, tone: "chart-2" },
  { id: "product", label: "Product", value: 18, tone: "chart-3" },
  { id: "referral", label: "Referral", value: 11, tone: "chart-4" },
  { id: "social", label: "Social", value: 6, tone: "chart-5" },
];

const DEFAULT_PAGES: ChartGroup14Page[] = [
  { path: "/pricing", views: 18420, share: 0.28 },
  { path: "/docs/start", views: 12680, share: 0.19 },
  { path: "/changelog", views: 9340, share: 0.14 },
  { path: "/blog/latency", views: 7120, share: 0.11 },
  { path: "/customers/northline", views: 5480, share: 0.08 },
];

const DEFAULT_PEOPLE: ChartGroup14Person[] = [
  {
    id: "amara",
    name: "Amara Cole",
    role: "On call",
    lastActive: "2m ago",
    initials: "AC",
    src: "/assets/4132445424a19cc6.webp",
  },
  {
    id: "julian",
    name: "Julian Voss",
    role: "Reviewing",
    lastActive: "11m ago",
    initials: "JV",
    src: "/assets/8e9489842d5e2cdf.webp",
  },
  {
    id: "nori",
    name: "Nori Hale",
    role: "Shipping",
    lastActive: "24m ago",
    initials: "NH",
    src: "/assets/9b8fa9955b8bd54f.webp",
  },
  {
    id: "ines",
    name: "Ines Caetano",
    role: "Idle",
    lastActive: "1h ago",
    initials: "IC",
  },
  {
    id: "reed",
    name: "Reed Lang",
    role: "On call",
    lastActive: "3h ago",
    initials: "RL",
    src: "/assets/8c18989537b833e8.webp",
  },
];

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addMonths(iso: string, months: number) {
  const date = parseIso(`${iso.slice(0, 8)}01`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

function buildDefaultSeries(endDate: string): ChartGroup14Day[] {
  const rand = mulberry32(14);
  const days = 90;
  const start = addDays(endDate, -(days - 1));
  return Array.from({ length: days }, (_, index) => {
    const wave = Math.sin(index / 9) * 0.18 + Math.cos(index / 17) * 0.08;
    const climb = index / days;
    return {
      date: addDays(start, index),
      revenue: Math.round(18400 + climb * 9200 + wave * 5400 + rand() * 2100),
      users: Math.round(620 + climb * 280 + wave * 90 + rand() * 70),
      sessions: Math.round(1480 + climb * 640 + wave * 220 + rand() * 180),
      bounce: Number((0.41 - climb * 0.06 + (rand() - 0.5) * 0.04).toFixed(3)),
    };
  });
}

function parseIso(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`);
}

function formatDay(iso: string) {
  return parseIso(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatRangeLabel(start: string, end: string) {
  const startDate = parseIso(start);
  const endDate = parseIso(end);
  const sameYear = startDate.getUTCFullYear() === endDate.getUTCFullYear();
  const left = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
    timeZone: "UTC",
  });
  const right = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${left} - ${right}`;
}

function formatMonthTitle(iso: string) {
  return parseIso(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function formatPercent(value: number, digits = 1) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(digits)}%`;
}

function clampIso(iso: string, min: string, max: string) {
  if (iso < min) return min;
  if (iso > max) return max;
  return iso;
}

function compareChange(current: number, previous: number) {
  if (!previous) return { ratio: 0, improved: current >= 0 };
  const ratio = (current - previous) / Math.abs(previous);
  return { ratio, improved: ratio >= 0 };
}

function sliceSeries(series: ChartGroup14Day[], start: string, end: string) {
  return series.filter((day) => day.date >= start && day.date <= end);
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
  const first = parseIso(`${monthIso.slice(0, 8)}01`);
  const year = first.getUTCFullYear();
  const month = first.getUTCMonth();
  const startWeekday = first.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<{
    key: string;
    iso: string | null;
    label: number | null;
  }> = [];
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ key: `${year}-${month}-pad-${i}`, iso: null, label: null });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ key: iso, iso, label: day });
  }
  return cells;
}

function isBetween(iso: string, start: string, end: string) {
  const [from, to] = start <= end ? [start, end] : [end, start];
  return iso > from && iso < to;
}

function StatGlyph({
  id,
}: {
  id: "revenue" | "users" | "sessions" | "bounce";
}) {
  const className = "size-4";
  if (id === "revenue") return <DollarSignIcon className={className} />;
  if (id === "users") return <UsersIcon className={className} />;
  if (id === "sessions") return <MousePointerClickIcon className={className} />;
  return <TrendingDownIcon className={className} />;
}

function RevenueChart({
  days,
  className,
}: {
  days: ChartGroup14Day[];
  className?: string;
}) {
  const gradientId = useId();
  const values = days.map((day) => day.revenue);
  const { line, area } = areaPath(values);
  const ticks = days.filter(
    (_, index) =>
      index === 0 ||
      index === days.length - 1 ||
      index === Math.floor((days.length - 1) / 2) ||
      index === Math.floor((days.length - 1) / 4) ||
      index === Math.floor(((days.length - 1) * 3) / 4),
  );
  const total = values.reduce((sum, value) => sum + value, 0);
  return (
    <article
      className={cn(
        "flex min-h-80 flex-col rounded-[--radius] border border-border bg-card p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Revenue</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Daily take across the selected range
          </p>
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          {formatCurrency(total)} total
        </p>
      </div>
      <svg
        viewBox="0 0 100 42"
        className="mt-6 h-44 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Revenue area chart totaling ${formatCurrency(total)}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--jk-chart-1)"
              stopOpacity="0.45"
            />
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
    </article>
  );
}

function ChannelDonut({ channels }: { channels: ChartGroup14Channel[] }) {
  const total = channels.reduce((sum, channel) => sum + channel.value, 0) || 1;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <article className="flex min-h-80 flex-col rounded-[--radius] border border-border bg-card p-5">
      <div>
        <h3 className="text-sm font-medium">Traffic channels</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Session mix for this window
        </p>
      </div>
      <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:items-center">
        <div className="relative size-40 shrink-0">
          <svg
            viewBox="0 0 100 100"
            className="size-full -rotate-90"
            role="img"
            aria-label="Traffic channel distribution"
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="var(--jk-muted)"
              strokeWidth="12"
            />
            {channels.map((channel) => {
              const length = (channel.value / total) * circumference;
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
                {total}
              </p>
              <p className="text-[10px] text-muted-foreground">share pts</p>
            </div>
          </div>
        </div>
        <ul className="w-full min-w-0 space-y-2.5">
          {channels.map((channel) => (
            <li
              key={channel.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
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
    </article>
  );
}

function TopPages({
  pages,
  href,
}: {
  pages: ChartGroup14Page[];
  href: string;
}) {
  return (
    <article className="flex min-h-72 flex-col rounded-[--radius] border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Top pages</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Ranked by views in this range
          </p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
          <a href={href}>View all</a>
        </Button>
      </div>
      <ol className="mt-5 space-y-3">
        {pages.map((page, index) => (
          <li
            key={page.path}
            className="grid grid-cols-[2rem_1fr_auto] items-center gap-3"
          >
            <span className="font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="truncate font-mono text-sm">{page.path}</p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-1"
                  style={{ width: `${Math.max(page.share * 100, 6)}%` }}
                />
              </div>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {formatNumber(page.views)}
            </span>
          </li>
        ))}
      </ol>
    </article>
  );
}

function ActivePeople({
  people,
  href,
}: {
  people: ChartGroup14Person[];
  href: string;
}) {
  return (
    <article className="flex min-h-72 flex-col rounded-[--radius] border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Active people</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Who is still in the product
          </p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
          <a href={href}>View all</a>
        </Button>
      </div>
      <ul className="mt-5 space-y-3">
        {people.map((person) => (
          <li key={person.id} className="flex items-center gap-3">
            <Avatar size="sm">
              {person.src ? (
                <AvatarImage src={person.src} alt={person.name} />
              ) : null}
              <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{person.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {person.role}
              </p>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {person.lastActive}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function RangeCalendar({
  viewMonth,
  onViewMonth,
  draftStart,
  draftEnd,
  min,
  max,
  onPick,
}: {
  viewMonth: string;
  onViewMonth: (iso: string) => void;
  draftStart: string;
  draftEnd: string;
  min: string;
  max: string;
  onPick: (iso: string) => void;
}) {
  const cells = monthCells(viewMonth);
  const start = draftStart <= draftEnd ? draftStart : draftEnd;
  const end = draftStart <= draftEnd ? draftEnd : draftStart;
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-8 p-0"
          aria-label="Previous month"
          onClick={() => onViewMonth(addMonths(viewMonth, -1))}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <p className="text-sm font-medium">{formatMonthTitle(viewMonth)}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-8 p-0"
          aria-label="Next month"
          onClick={() => onViewMonth(addMonths(viewMonth, 1))}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-[10px] font-medium tracking-wide text-muted-foreground"
          >
            {day}
          </span>
        ))}
        {cells.map((cell) => {
          if (!cell.iso) {
            return <span key={cell.key} />;
          }
          const iso = cell.iso;
          const disabled = iso < min || iso > max;
          const selected = iso === start || iso === end;
          const mid = isBetween(iso, start, end);
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onPick(iso)}
              className={cn(
                "h-8 rounded-md text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected && "bg-primary text-primary-foreground",
                mid && "bg-primary/10 text-foreground",
                !selected && !mid && "hover:bg-accent",
                disabled && "opacity-30",
              )}
            >
              {cell.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ChartGroup14({
  className,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  presets = DEFAULT_PRESETS,
  defaultPresetId = "30d",
  referenceDate = DEFAULT_REFERENCE,
  series: seriesProp,
  channels = DEFAULT_CHANNELS,
  pages = DEFAULT_PAGES,
  people = DEFAULT_PEOPLE,
  pagesHref = DEFAULT_PAGES_HREF,
  peopleHref = DEFAULT_PEOPLE_HREF,
  ...props
}: ChartGroup14Props) {
  const headingId = useId();
  const series = useMemo(
    () => seriesProp ?? buildDefaultSeries(referenceDate),
    [seriesProp, referenceDate],
  );
  const seriesMin = series[0]?.date ?? addDays(referenceDate, -89);
  const seriesMax = series[series.length - 1]?.date ?? referenceDate;
  const initialPreset =
    presets.find((preset) => preset.id === defaultPresetId) ?? presets[0];
  const [presetId, setPresetId] = useState(initialPreset?.id ?? "custom");
  const [range, setRange] = useState(() => {
    const days = initialPreset?.days ?? 30;
    return {
      start: clampIso(
        addDays(referenceDate, -(days - 1)),
        seriesMin,
        seriesMax,
      ),
      end: clampIso(referenceDate, seriesMin, seriesMax),
    };
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(`${range.end.slice(0, 8)}01`);
  const [draftStart, setDraftStart] = useState(range.start);
  const [draftEnd, setDraftEnd] = useState(range.end);
  const [picking, setPicking] = useState<"start" | "end">("start");

  const currentDays = useMemo(
    () => sliceSeries(series, range.start, range.end),
    [series, range.end, range.start],
  );
  const previousDays = useMemo(() => {
    const length = Math.max(currentDays.length, 1);
    const prevEnd = addDays(range.start, -1);
    const prevStart = addDays(prevEnd, -(length - 1));
    return sliceSeries(series, prevStart, prevEnd);
  }, [currentDays.length, range.start, series]);

  const stats = useMemo(() => {
    const sum = (days: ChartGroup14Day[], key: keyof ChartGroup14Day) =>
      days.reduce((total, day) => total + Number(day[key]), 0);
    const avg = (days: ChartGroup14Day[], key: keyof ChartGroup14Day) =>
      days.length ? sum(days, key) / days.length : 0;
    const revenue = sum(currentDays, "revenue");
    const users = sum(currentDays, "users");
    const sessions = sum(currentDays, "sessions");
    const bounce = avg(currentDays, "bounce");
    const prevRevenue = sum(previousDays, "revenue");
    const prevUsers = sum(previousDays, "users");
    const prevSessions = sum(previousDays, "sessions");
    const prevBounce = avg(previousDays, "bounce");
    const revenueChange = compareChange(revenue, prevRevenue);
    const usersChange = compareChange(users, prevUsers);
    const sessionsChange = compareChange(sessions, prevSessions);
    const bounceChange = compareChange(bounce, prevBounce);
    return [
      {
        id: "revenue" as const,
        label: "Revenue",
        value: formatCurrency(revenue),
        change: formatPercent(revenueChange.ratio),
        improved: revenueChange.improved,
        tone: "chart-1" as const,
      },
      {
        id: "users" as const,
        label: "Users",
        value: formatNumber(users),
        change: formatPercent(usersChange.ratio),
        improved: usersChange.improved,
        tone: "chart-2" as const,
      },
      {
        id: "sessions" as const,
        label: "Sessions",
        value: formatNumber(sessions),
        change: formatPercent(sessionsChange.ratio),
        improved: sessionsChange.improved,
        tone: "chart-3" as const,
      },
      {
        id: "bounce" as const,
        label: "Bounce rate",
        value: formatPercent(bounce, 1).replace("+", ""),
        change: formatPercent(bounceChange.ratio),
        improved: !bounceChange.improved,
        tone: "chart-5" as const,
      },
    ];
  }, [currentDays, previousDays]);

  const activePreset = presets.find((preset) => preset.id === presetId);
  const heading = activePreset?.label ?? "Custom range";

  const applyPreset = (id: string) => {
    const preset = presets.find((item) => item.id === id);
    if (!preset) return;
    const next = {
      start: clampIso(
        addDays(referenceDate, -(preset.days - 1)),
        seriesMin,
        seriesMax,
      ),
      end: clampIso(referenceDate, seriesMin, seriesMax),
    };
    setPresetId(preset.id);
    setRange(next);
  };

  const openCalendar = (open: boolean) => {
    setCalendarOpen(open);
    if (open) {
      setDraftStart(range.start);
      setDraftEnd(range.end);
      setViewMonth(`${range.end.slice(0, 8)}01`);
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

  const applyCustom = () => {
    const start = draftStart <= draftEnd ? draftStart : draftEnd;
    const end = draftStart <= draftEnd ? draftEnd : draftStart;
    setRange({ start, end });
    setPresetId("custom");
    setCalendarOpen(false);
  };

  return (
    <section
      data-slot="chart-group14"
      className={cn("bg-background text-foreground", className)}
      aria-labelledby={headingId}
      {...props}
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2
              id={headingId}
              className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                {description}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground">{heading}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="secondary"
                    size="sm"
                    className="min-w-40 justify-between gap-2"
                  >
                    {activePreset?.label ?? "Custom range"}
                    <ChevronDownIcon className="size-4 opacity-70" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-44">
                {presets.map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                  >
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
                    <span className="hidden sm:inline">
                      {formatRangeLabel(range.start, range.end)}
                    </span>
                    <span className="sm:hidden">Range</span>
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Custom range</DialogTitle>
                  <DialogDescription>
                    Pick a start day, then an end day. Charts stay inside the
                    sample window.
                  </DialogDescription>
                </DialogHeader>
                <RangeCalendar
                  viewMonth={viewMonth}
                  onViewMonth={setViewMonth}
                  draftStart={draftStart}
                  draftEnd={draftEnd}
                  min={seriesMin}
                  max={seriesMax}
                  onPick={pickDay}
                />
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
                  <Button type="button" size="sm" onClick={applyCustom}>
                    Apply range
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div
          className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          aria-live="polite"
        >
          {stats.map((stat) => (
            <article
              key={stat.id}
              className="rounded-[--radius] border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-[calc(var(--radius)-0.35rem)]",
                    TONE_ICON[stat.tone],
                  )}
                >
                  <StatGlyph id={stat.id} />
                </span>
                <Badge
                  variant={stat.improved ? "outline" : "destructive"}
                  className={cn(
                    stat.improved &&
                      "border-transparent bg-success/15 text-success",
                  )}
                >
                  {stat.change}
                </Badge>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {stat.value}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-12">
          <RevenueChart className="lg:col-span-8" days={currentDays} />
          <div className="lg:col-span-4">
            <ChannelDonut channels={channels} />
          </div>
          <div className="lg:col-span-6">
            <TopPages pages={pages} href={pagesHref} />
          </div>
          <div className="lg:col-span-6">
            <ActivePeople people={people} href={peopleHref} />
          </div>
        </div>
      </div>
    </section>
  );
}
