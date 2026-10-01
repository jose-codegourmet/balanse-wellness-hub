"use client";

import { Button, cn } from "@balanse/ui";
import type { Header } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon className="size-3" aria-hidden />;
  if (sorted === "desc") return <ArrowDownIcon className="size-3" aria-hidden />;
  return <ChevronsUpDownIcon className="size-3" aria-hidden />;
}

export function AdminDataTableColumnHeader<TData>({
  header,
  sticky,
}: {
  header: Header<TData, unknown>;
  sticky?: boolean;
}) {
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();
  const ariaSort = sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none";

  return (
    <th
      scope="col"
      aria-sort={canSort ? ariaSort : undefined}
      className={cn(
        // px-3 between columns (edges stay 5) keeps 8–9 column tables well under the 1024px
        // cards floor, so a container that passes the floor never scrolls sideways.
        "h-11 border-b border-border bg-muted/50 px-3 align-middle whitespace-nowrap first:pl-5 last:pr-5",
        sticky && "sticky top-0 z-10",
      )}
    >
      {header.isPlaceholder ? null : canSort ? (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className={cn(
            "-mx-2.5 text-muted-foreground hover:text-foreground",
            sorted && "text-foreground",
          )}
          onClick={header.column.getToggleSortingHandler()}
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          <SortIcon sorted={sorted} />
        </Button>
      ) : (
        <span className="text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {flexRender(header.column.columnDef.header, header.getContext())}
        </span>
      )}
    </th>
  );
}
