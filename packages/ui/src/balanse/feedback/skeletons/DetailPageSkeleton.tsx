import { Skeleton } from "../../../components/skeleton/Skeleton";
import { cn } from "../../../lib/utils";
import { countKeys } from "./count-keys";
import type { DetailPageSkeletonProps } from "./DetailPageSkeleton.schema";

function BookingBlockSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <section className="mt-8">
      <Skeleton className={cn("h-8", titleWidth)} />
      <ul className="mt-3 space-y-2">
        {countKeys("row", 2).map((rowKey) => (
          <li key={rowKey} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-4 w-1/2" />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DetailPageSkeleton({ label, className }: DetailPageSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={cn("w-full", className)}>
      <div aria-hidden="true">
        <Skeleton className="h-9 w-48" />
        <section className="mt-6">
          <Skeleton className="h-8 w-28" />
          <dl className="mt-3 grid gap-2">
            {countKeys("field", 3).map((fieldKey) => (
              <div key={fieldKey}>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-1 h-4 w-40" />
              </div>
            ))}
          </dl>
        </section>
        <BookingBlockSkeleton titleWidth="w-32" />
        <BookingBlockSkeleton titleWidth="w-28" />
        <BookingBlockSkeleton titleWidth="w-24" />
        <section className="mt-8">
          <Skeleton className="h-8 w-56" />
          <ul className="mt-3 space-y-2">
            {countKeys("pay", 2).map((payKey) => (
              <li key={payKey} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="mt-2 h-4 w-1/2" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
