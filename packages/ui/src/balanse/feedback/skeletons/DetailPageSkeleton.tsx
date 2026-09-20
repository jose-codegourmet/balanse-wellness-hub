import { Skeleton } from "../../../components/skeleton/Skeleton";
import { cn } from "../../../lib/utils";
import { countKeys } from "./count-keys";
import type { DetailPageSkeletonProps } from "./DetailPageSkeleton.schema";

export function DetailPageSkeleton({ label, className }: DetailPageSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={cn("w-full", className)}>
      <div aria-hidden="true">
        <Skeleton className="h-9 w-48" />
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div>
            <Skeleton className="h-8 w-32" />
            <dl className="mt-3 grid gap-2">
              {countKeys("field", 4).map((fieldKey) => (
                <div key={fieldKey}>
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="mt-1 h-4 w-40" />
                </div>
              ))}
            </dl>
          </div>
          <div>
            <Skeleton className="h-8 w-36" />
            <ul className="mt-3 space-y-2">
              {countKeys("row", 3).map((rowKey) => (
                <li key={rowKey} className="rounded-xl border border-border p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
