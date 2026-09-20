import { Skeleton } from "../../../components/skeleton/Skeleton";
import { cn } from "../../../lib/utils";
import type { BentoSkeletonProps } from "./BentoSkeleton.schema";
import { countKeys } from "./count-keys";

export function BentoSkeleton({ label, tiles = 4, className }: BentoSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={cn("w-full", className)}>
      <div aria-hidden="true">
        <Skeleton className="h-9 w-40" />
        <div className="mt-6 grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-2 xl:grid-cols-5">
          {countKeys("stat", 5).map((statKey, index) => (
            <div
              key={statKey}
              className={cn(
                "block p-4 md:p-5",
                index ? "border-border/50 border-t md:border-t-0 md:border-l" : null,
              )}
            >
              <Skeleton className="h-4 w-28" />
              <div className="mt-8 flex items-end justify-between">
                <Skeleton className="h-8 w-16" />
                <div className="flex items-end gap-1">
                  {countKeys("bar", 7).map((barKey) => (
                    <Skeleton key={barKey} className="h-6 w-1.5 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="mt-10 h-8 w-48" />
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {countKeys("attention", 3).map((attentionKey) => (
            <li key={attentionKey} className="flex flex-col gap-1 px-4 py-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56" />
            </li>
          ))}
        </ul>
        <div className="mt-10 w-full text-foreground">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <hr className="my-5 h-px border-0 bg-border" />
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <Skeleton className="h-8 w-52 rounded-md" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-muted/40">
                    {countKeys("sched-col", 5).map((columnKey) => (
                      <th key={columnKey} className="h-9 px-2 first:pl-4 last:pr-4">
                        <Skeleton className="h-3 w-16" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {countKeys("sched-row", 4).map((rowKey) => (
                    <tr key={rowKey} className="border-b border-border/60 last:border-b-0">
                      {countKeys("sched-cell", 5).map((cellKey) => (
                        <td key={cellKey} className="px-2 py-2 align-middle first:pl-4 last:pr-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <section className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {countKeys("tile", tiles).map((tileKey) => (
            <article key={tileKey} className="rounded-xl border border-border bg-muted/30 p-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-8 w-24" />
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
