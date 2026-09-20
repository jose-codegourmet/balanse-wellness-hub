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
        <ul className="mt-6 space-y-4">
          {countKeys("item", items).map((itemKey) => (
            <li key={itemKey} className="rounded-xl border border-border p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Skeleton className="h-8 w-36 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-8 w-36 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
