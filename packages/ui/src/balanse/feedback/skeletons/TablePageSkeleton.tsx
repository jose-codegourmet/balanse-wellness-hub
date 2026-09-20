import { Skeleton } from "../../../components/skeleton/Skeleton";
import { cn } from "../../../lib/utils";
import { countKeys } from "./count-keys";
import type { TablePageSkeletonProps } from "./TablePageSkeleton.schema";

export function TablePageSkeleton({
  label,
  rows = 4,
  columns = 5,
  className,
}: TablePageSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn("w-full text-foreground", className)}
    >
      <div aria-hidden="true">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
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
                  {countKeys("col", columns).map((columnKey) => (
                    <th key={columnKey} className="h-9 px-2 first:pl-4 last:pr-4">
                      <Skeleton className="h-3 w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countKeys("row", rows).map((rowKey) => (
                  <tr key={rowKey} className="border-b border-border/60 last:border-b-0">
                    {countKeys("cell", columns).map((cellKey) => (
                      <td key={cellKey} className="px-2 py-2 align-middle first:pl-4 last:pr-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/20 px-4 py-2.5">
            <Skeleton className="h-3 w-20" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-7 rounded-md" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="size-7 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
