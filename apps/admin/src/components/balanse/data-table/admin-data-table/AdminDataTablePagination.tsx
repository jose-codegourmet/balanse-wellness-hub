"use client";

import {
  Button,
  Label,
  NativeSelect,
  NativeSelectOption,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@balanse/ui";
import type { Table } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { ADMIN_DATA_TABLE_PAGE_SIZES } from "./AdminDataTable.defaults";
import type { AdminDataTableLabels } from "./AdminDataTable.schema";

export function AdminDataTablePagination<TData>({
  table,
  tableId,
  labels,
  filteredCount,
  enablePageSize,
}: {
  table: Table<TData>;
  tableId: string;
  labels: AdminDataTableLabels;
  filteredCount: number;
  enablePageSize: boolean;
}) {
  const pageCount = Math.max(1, table.getPageCount());
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageSizeId = `${tableId}-page-size`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-muted/20 px-4 py-2.5">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {filteredCount} {filteredCount === 1 ? labels.result : labels.results}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {enablePageSize ? (
          <div className="flex items-center gap-2">
            <Label htmlFor={pageSizeId} className="text-xs text-muted-foreground">
              {labels.pageSize}
            </Label>
            <NativeSelect
              id={pageSizeId}
              size="sm"
              value={String(table.getState().pagination.pageSize)}
              onChange={(event) => {
                table.setPageSize(Number(event.target.value));
                table.setPageIndex(0);
              }}
            >
              {ADMIN_DATA_TABLE_PAGE_SIZES.map((size) => (
                <NativeSelectOption key={size} value={String(size)}>
                  {size}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        ) : null}
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  aria-label={labels.previous}
                />
              }
            >
              <ChevronLeftIcon className="size-3.5" aria-hidden />
            </TooltipTrigger>
            <TooltipContent>{labels.previous}</TooltipContent>
          </Tooltip>
          <span className="px-1 text-xs text-muted-foreground tabular-nums">
            {labels.page} {currentPage} of {pageCount}
          </span>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  aria-label={labels.next}
                />
              }
            >
              <ChevronRightIcon className="size-3.5" aria-hidden />
            </TooltipTrigger>
            <TooltipContent>{labels.next}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
