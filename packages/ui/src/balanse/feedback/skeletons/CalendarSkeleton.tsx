"use client";

import { BALANSE_BREAKPOINTS } from "@balanse/config";
import { Skeleton } from "../../../components/skeleton/Skeleton";
import { useBreakpoint } from "../../../hooks/use-breakpoint/UseBreakpoint";
import { cn } from "../../../lib/utils";
import type { CalendarSkeletonProps, CalendarSkeletonView } from "./CalendarSkeleton.schema";
import { countKeys } from "./count-keys";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function resolveView(
  view: CalendarSkeletonView,
  breakpoint: ReturnType<typeof useBreakpoint>,
): Exclude<CalendarSkeletonView, "auto"> {
  if (view !== "auto") return view;
  return detectCalendarView(BALANSE_BREAKPOINTS[breakpoint]);
}

/** Same rule as `detectView()` on `ScheduleCalendar`. */
export function detectCalendarView(width: number): Exclude<CalendarSkeletonView, "auto"> {
  if (width >= BALANSE_BREAKPOINTS.desktop) return "month";
  if (width >= BALANSE_BREAKPOINTS.tablet) return "week";
  return "day";
}

function dayCell(dayKey: string) {
  return (
    <div key={dayKey} className="min-h-16 rounded-md border border-border bg-card px-2 py-2">
      <Skeleton className="h-4 w-6" />
      <Skeleton className="mt-2 h-3 w-12" />
    </div>
  );
}

function DayAgenda() {
  return (
    <ul className="space-y-2" data-calendar-grid="day">
      {countKeys("agenda", 4).map((rowKey) => (
        <li
          key={rowKey}
          className="flex flex-col gap-2 rounded-md border border-border bg-card px-3 py-3"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </li>
      ))}
    </ul>
  );
}

function CalendarGrid({
  view,
  weeks,
}: {
  view: Exclude<CalendarSkeletonView, "auto">;
  weeks: number;
}) {
  if (view === "day") return <DayAgenda />;

  const dayCount = view === "week" ? 7 : weeks * 7;
  return (
    <div data-calendar-grid={view} className="grid grid-cols-7 gap-2">
      {WEEKDAYS.map((weekday) => (
        <div key={weekday} className="px-1 text-xs font-medium text-muted-foreground">
          {weekday}
        </div>
      ))}
      {countKeys("day", dayCount).map((dayKey) => dayCell(dayKey))}
    </div>
  );
}

export function CalendarSkeleton({
  className,
  weeks = 5,
  view = "auto",
  label = "Loading schedule",
}: CalendarSkeletonProps) {
  const breakpoint = useBreakpoint();
  const resolvedView = resolveView(view, breakpoint);

  return (
    <div role="status" aria-busy="true" aria-label={label} className={cn("space-y-4", className)}>
      <div aria-hidden="true" className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {countKeys("chip", 4).map((chipKey) => (
            <Skeleton key={chipKey} className="h-8 w-16 rounded-md" />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-7 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start xl:gap-6">
          <CalendarGrid view={resolvedView} weeks={weeks} />
          <div className="mt-8 grid gap-4 xl:sticky xl:top-8 xl:mt-0">
            <ul className="space-y-2">
              {countKeys("session", 3).map((sessionKey) => (
                <li
                  key={sessionKey}
                  className="flex flex-col gap-1 rounded-md border border-border px-3 py-3"
                >
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </li>
              ))}
            </ul>
            <aside className="rounded-md border border-border px-3 py-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
              <Skeleton className="mt-4 h-8 w-28 rounded-md" />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
