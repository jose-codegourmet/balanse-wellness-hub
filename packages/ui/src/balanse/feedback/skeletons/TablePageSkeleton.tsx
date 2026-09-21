"use client";

import { Skeleton } from "../../../components/skeleton/Skeleton";
import { useIsMobile } from "../../../hooks/use-breakpoint/UseBreakpoint";
import { cn } from "../../../lib/utils";
import { countKeys } from "./count-keys";
import type { TablePageSkeletonLayout, TablePageSkeletonProps } from "./TablePageSkeleton.schema";

function resolveCardMode(layout: TablePageSkeletonLayout, isMobile: boolean): boolean {
  if (layout === "cards") return true;
  if (layout === "table") return false;
  return isMobile;
}

function PageHeader() {
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
      </div>
      <hr className="my-5 h-px border-0 bg-border" />
    </>
  );
}

function ToolbarPlaceholder({ cardMode }: { cardMode: boolean }) {
  if (cardMode) {
    return (
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-11 w-full rounded-md" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-11 w-24 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-8 w-52 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

function PaginationPlaceholder() {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/20 px-4 py-2.5">
      <Skeleton className="h-3 w-20" />
      <div className="flex items-center gap-1.5">
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="size-7 rounded-md" />
      </div>
    </div>
  );
}

function TablePlaceholder({
  rows,
  columns,
  leadingCell,
}: {
  rows: number;
  columns: number;
  leadingCell: TablePageSkeletonProps["leadingCell"];
}) {
  return (
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
                {countKeys("cell", columns).map((cellKey, cellIndex) => (
                  <td key={cellKey} className="px-2 py-2 align-middle first:pl-4 last:pr-4">
                    {leadingCell === "avatar" && cellIndex === 0 ? (
                      <Skeleton className="size-10 rounded-full" />
                    ) : (
                      <Skeleton className="h-4 w-full" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationPlaceholder />
    </div>
  );
}

function CardPlaceholder({
  cardKey,
  leadingCell,
  metaRows,
}: {
  cardKey: string;
  leadingCell: TablePageSkeletonProps["leadingCell"];
  metaRows: number;
}) {
  return (
    <li
      key={cardKey}
      data-slot="admin-data-table-card-skeleton"
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {leadingCell === "avatar" ? <Skeleton className="mt-0.5 size-10 shrink-0 rounded-full" /> : null}
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-40 max-w-full" />
            <Skeleton className="h-4 w-48 max-w-full" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>
      {metaRows > 0 ? (
        <div className="grid gap-2 p-4">
          {countKeys("meta", metaRows).map((metaKey) => (
            <div key={metaKey} className="grid gap-1">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : null}
    </li>
  );
}

function CardListPlaceholder({
  rows,
  columns,
  leadingCell,
}: {
  rows: number;
  columns: number;
  leadingCell: TablePageSkeletonProps["leadingCell"];
}) {
  const metaRows = Math.min(3, Math.max(0, columns - 2));
  return (
    <div>
      <ul className="space-y-4">
        {countKeys("card", rows).map((cardKey) => (
          <CardPlaceholder
            key={cardKey}
            cardKey={cardKey}
            leadingCell={leadingCell}
            metaRows={metaRows}
          />
        ))}
      </ul>
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        <PaginationPlaceholder />
      </div>
    </div>
  );
}

export function TablePageSkeleton({
  label,
  rows = 4,
  columns = 5,
  className,
  leadingCell = "bar",
  layout = "auto",
  chrome = "page",
}: TablePageSkeletonProps) {
  const isMobile = useIsMobile();
  const cardMode = resolveCardMode(layout, isMobile);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-layout={cardMode ? "cards" : "table"}
      className={cn("w-full text-foreground", className)}
    >
      <div aria-hidden="true">
        {chrome === "page" ? <PageHeader /> : null}
        <ToolbarPlaceholder cardMode={cardMode} />
        {cardMode ? (
          <CardListPlaceholder rows={rows} columns={columns} leadingCell={leadingCell} />
        ) : (
          <TablePlaceholder rows={rows} columns={columns} leadingCell={leadingCell} />
        )}
      </div>
    </div>
  );
}
