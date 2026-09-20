import { Skeleton } from "../../../components/skeleton/Skeleton";
import { cn } from "../../../lib/utils";
import type { CalendarSkeletonProps } from "./CalendarSkeleton.schema";
import { countKeys } from "./count-keys";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function dayCell(dayKey: string) {
  return (
    <div key={dayKey} className="min-h-16 rounded-md border border-border bg-card px-2 py-2">
      <Skeleton className="h-4 w-6" />
      <Skeleton className="mt-2 h-3 w-12" />
    </div>
  );
}

export function CalendarSkeleton({
  className,
  weeks = 5,
  view = "month",
  label = "Loading schedule",
}: CalendarSkeletonProps) {
  const dayCount = view === "day" ? 1 : view === "week" ? 7 : weeks * 7;

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
        <div className={cn("grid gap-2", view !== "day" && "grid-cols-7")}>
          {view !== "day"
            ? WEEKDAYS.map((weekday) => (
                <div key={weekday} className="px-1 text-xs font-medium text-muted-foreground">
                  {weekday}
                </div>
              ))
            : null}
          {countKeys("day", dayCount).map((dayKey) => dayCell(dayKey))}
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_20rem]">
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
  );
}
