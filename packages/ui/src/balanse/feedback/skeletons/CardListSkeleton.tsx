import { Skeleton } from "../../../components/skeleton/Skeleton";
import { cn } from "../../../lib/utils";
import type { CardListSkeletonProps } from "./CardListSkeleton.schema";
import { countKeys } from "./count-keys";

export function CardListSkeleton({ label, items = 3, className }: CardListSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={cn("w-full", className)}>
      <div aria-hidden="true">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-3 h-4 max-w-2xl w-full" />
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
          {countKeys("filter", 3).map((filterKey) => (
            <Skeleton key={filterKey} className="h-8 w-28 shrink-0 rounded-md" />
          ))}
        </div>
        <ul className="mt-6 space-y-4">
          {countKeys("item", items).map((itemKey) => (
            <li
              key={itemKey}
              className="min-h-40 overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="flex items-start justify-between gap-3 border-b border-border p-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48 max-w-full" />
                </div>
                <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
              </div>
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
