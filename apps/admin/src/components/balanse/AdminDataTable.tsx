"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type Row,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  SearchIcon,
} from "lucide-react";
import { type ReactNode, useId, useMemo, useState } from "react";
import { Badge } from "@/components/jabkit/badge";
import { cn } from "@/components/jabkit/lib/cn";

export type AdminStatusTone = "primary" | "secondary" | "destructive" | "outline";

export function AdminStatusBadge({
  label,
  tone = "secondary",
}: {
  label: string;
  tone?: AdminStatusTone;
}) {
  const dots: Record<AdminStatusTone, string> = {
    primary: "bg-primary-foreground",
    secondary: "bg-muted-foreground",
    destructive: "bg-destructive",
    outline: "bg-muted-foreground",
  };
  return (
    <Badge variant={tone} className="gap-1.5 rounded-full text-[11px] font-medium">
      <span className={cn("inline-block size-1.5 shrink-0 rounded-full", dots[tone])} aria-hidden />
      {label}
    </Badge>
  );
}

export type AdminDataTableBulkAction<TData> = {
  id: string;
  label: string;
  onClick: (rows: TData[]) => void;
};

export type AdminDataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId?: (row: TData, index: number) => string;
  eyebrow?: string;
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  resultLabel?: string;
  resultsLabel?: string;
  selectedLabel?: string;
  clearLabel?: string;
  pageLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  footnote?: string;
  pageSize?: number;
  searchable?: boolean;
  selectable?: boolean;
  bulkActions?: AdminDataTableBulkAction<TData>[];
  toolbar?: ReactNode;
  summary?: ReactNode;
  onRowClick?: (row: TData) => void;
  className?: string;
};

const headLabel = "text-xs font-semibold tracking-wider text-muted-foreground uppercase";
const sortButtonClass =
  "-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase transition-colors duration-200 ease-out hover:text-foreground motion-reduce:transition-none";
const outlineButtonClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";
const iconButtonClass =
  "inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors duration-200 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUpIcon className="size-3" aria-hidden />;
  if (sorted === "desc") return <ArrowDownIcon className="size-3" aria-hidden />;
  return <ChevronsUpDownIcon className="size-3" aria-hidden />;
}

function SelectBox({
  checked,
  indeterminate,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      ref={(node) => {
        if (node) node.indeterminate = Boolean(indeterminate);
      }}
      onChange={(event) => onCheckedChange(event.target.checked)}
      className="size-4 rounded border-border accent-primary"
    />
  );
}

export function AdminDataTable<TData>({
  data,
  columns,
  getRowId,
  eyebrow,
  title,
  description,
  searchPlaceholder = "Search",
  emptyLabel = "No rows match your filter.",
  resultLabel = "result",
  resultsLabel = "results",
  selectedLabel = "selected",
  clearLabel = "Clear",
  pageLabel = "Page",
  previousLabel = "Previous page",
  nextLabel = "Next page",
  footnote,
  pageSize = 8,
  searchable = true,
  selectable = false,
  bulkActions,
  toolbar,
  summary,
  onRowClick,
  className,
}: AdminDataTableProps<TData>) {
  const headingId = useId();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectionColumn = useMemo<ColumnDef<TData, unknown>[]>(
    () =>
      selectable
        ? [
            {
              id: "_select",
              header: ({ table }) => (
                <SelectBox
                  checked={table.getIsAllPageRowsSelected()}
                  indeterminate={table.getIsSomePageRowsSelected()}
                  label="Select all rows on this page"
                  onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
                />
              ),
              cell: ({ row }) => (
                <SelectBox
                  checked={row.getIsSelected()}
                  label={`Select row ${row.id}`}
                  onCheckedChange={(checked) => row.toggleSelected(checked)}
                />
              ),
              enableSorting: false,
              enableGlobalFilter: false,
            },
          ]
        : [],
    [selectable],
  );

  const tableColumns = useMemo(() => [...selectionColumn, ...columns], [columns, selectionColumn]);

  const onSortingChange: OnChangeFn<SortingState> = setSorting;
  const onRowSelectionChange: OnChangeFn<RowSelectionState> = setRowSelection;

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, globalFilter: query, rowSelection },
    onSortingChange,
    onRowSelectionChange,
    onGlobalFilterChange: setQuery,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId,
    enableRowSelection: selectable,
    initialState: { pagination: { pageSize } },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const selectedRows = table.getSelectedRowModel().rows;
  const pageCount = Math.max(1, table.getPageCount());
  const currentPage = table.getState().pagination.pageIndex + 1;

  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cn("w-full text-foreground", className)}
    >
      {title || eyebrow || description || summary ? (
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            {eyebrow ? (
              <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 id={headingId} className="text-xl font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            ) : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {summary}
        </div>
      ) : null}

      {(searchable || toolbar) && (title || eyebrow || description) ? (
        <hr className="my-5 h-px border-0 bg-border" />
      ) : null}

      <div
        className={cn("mb-3 flex flex-wrap items-center justify-between gap-3", !title && "mt-0")}
      >
        <div className="flex flex-wrap items-center gap-3">
          {searchable ? (
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  table.setPageIndex(0);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-8 w-52 rounded-md border border-input bg-background pr-2.5 pl-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          ) : null}
          {toolbar}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{filteredCount}</span>{" "}
          {filteredCount === 1 ? resultLabel : resultsLabel}
        </p>
      </div>

      {selectable && selectedRows.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground tabular-nums">
              {selectedRows.length} {selectedLabel}
            </span>
            <button
              type="button"
              className="rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => table.resetRowSelection()}
            >
              {clearLabel}
            </button>
          </div>
          {bulkActions?.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {bulkActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={outlineButtonClass}
                  onClick={() => action.onClick(selectedRows.map((row) => row.original))}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            {title ? <caption className="sr-only">{title}</caption> : null}
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-muted/40">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <th key={header.id} scope="col" className="h-9 px-2 first:pl-4 last:pr-4">
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            className={sortButtonClass}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <SortIcon sorted={sorted} />
                          </button>
                        ) : (
                          <span className={headLabel}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableColumns.length}
                    className="h-24 px-4 text-center text-sm text-muted-foreground"
                  >
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                table
                  .getRowModel()
                  .rows.map((row) => <DataRow key={row.id} row={row} onRowClick={onRowClick} />)
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/20 px-4 py-2.5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {filteredCount} {filteredCount === 1 ? resultLabel : resultsLabel}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className={iconButtonClass}
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              aria-label={previousLabel}
            >
              <ChevronLeftIcon className="size-3.5" aria-hidden />
            </button>
            <span className="px-1 text-xs text-muted-foreground tabular-nums">
              {pageLabel} {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              className={iconButtonClass}
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              aria-label={nextLabel}
            >
              <ChevronRightIcon className="size-3.5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
      {footnote ? <p className="mt-3 text-[11px] text-muted-foreground">{footnote}</p> : null}
    </section>
  );
}

function DataRow<TData>({
  row,
  onRowClick,
}: {
  row: Row<TData>;
  onRowClick?: (row: TData) => void;
}) {
  const selected = row.getIsSelected();
  return (
    <tr
      data-state={selected ? "selected" : undefined}
      className={cn(
        "border-b border-border/60 transition-colors duration-200 ease-out last:border-b-0 hover:bg-muted/30 motion-reduce:transition-none data-[state=selected]:bg-muted",
        onRowClick ? "cursor-pointer" : null,
      )}
      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
    >
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} className="px-2 py-2 align-middle first:pl-4 last:pr-4">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}
