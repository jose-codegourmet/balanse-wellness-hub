import { Skeleton } from "../../../components/skeleton/Skeleton";
import { cn } from "../../../lib/utils";
import type { CalendarSkeletonProps } from "./CalendarSkeleton.schema";
import { countKeys } from "./count-keys";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function CalendarSkeleton({
  className,
  weeks = 5,
  label = "Loading schedule",
}: CalendarSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn("rounded-xl border border-border bg-card p-4", className)}
    >
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
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className="px-1">
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
          {countKeys("day", weeks * 7).map((dayKey) => (
            <div
              key={dayKey}
              className="min-h-16 rounded-md border border-border bg-card px-2 py-2"
            >
              <Skeleton className="h-4 w-6" />
              <Skeleton className="mt-2 h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
