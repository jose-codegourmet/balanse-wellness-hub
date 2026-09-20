"use client";

import { Button } from "@balanse/ui";
import type { Header } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon className="size-3" aria-hidden />;
  if (sorted === "desc") return <ArrowDownIcon className="size-3" aria-hidden />;
  return <ChevronsUpDownIcon className="size-3" aria-hidden />;
}

export function AdminDataTableColumnHeader<TData>({ header }: { header: Header<TData, unknown> }) {
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();
  const ariaSort = sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none";

  return (
    <th
      scope="col"
      aria-sort={canSort ? ariaSort : undefined}
      className="h-9 bg-muted/40 px-2 first:pl-4 last:pr-4"
    >
      {header.isPlaceholder ? null : canSort ? (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="-mx-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:text-foreground"
          onClick={header.column.getToggleSortingHandler()}
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          <SortIcon sorted={sorted} />
        </Button>
      ) : (
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {flexRender(header.column.columnDef.header, header.getContext())}
        </span>
      )}
    </th>
  );
}
