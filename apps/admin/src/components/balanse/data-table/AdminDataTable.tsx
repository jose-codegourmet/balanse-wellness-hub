"use client";

import { ADMIN_BOOKING_PAGE_SIZE, type FeedbackStateId } from "@balanse/domain";
import {
  Button,
  Checkbox,
  cn,
  FeedbackState,
  Separator,
  TablePageSkeleton,
  TooltipProvider,
} from "@balanse/ui";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type Row,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { type ReactNode, Suspense, useId, useMemo, useState } from "react";

import { adminDataTableDefaultLabels } from "./AdminDataTable.defaults";
import type {
  AdminDataTableDensity,
  AdminDataTableLabels,
  AdminDataTableProps,
} from "./AdminDataTable.schema";
import { AdminDataTableColumnHeader } from "./AdminDataTableColumnHeader";
import { AdminDataTablePagination } from "./AdminDataTablePagination";
import { AdminDataTableRowActions } from "./AdminDataTableRowActions";
import { AdminDataTableToolbar } from "./AdminDataTableToolbar";
import { useAdminDataTablePrefs } from "./useAdminDataTablePrefs";
import {
  type AdminDataTableUrlState,
  useAdminDataTableUrlState,
} from "./useAdminDataTableUrlState";

export type {
  AdminDataTableBulkAction,
  AdminDataTableDensity,
  AdminDataTableLabels,
  AdminDataTableProps,
  AdminDataTableRowAction,
} from "./AdminDataTable.schema";

function mergeLabels(labels?: Partial<AdminDataTableLabels>): AdminDataTableLabels {
  return { ...adminDataTableDefaultLabels, ...labels };
}

function AdminDataTableUrlBridge({
  tableId,
  children,
}: {
  tableId: string;
  children: (state: AdminDataTableUrlState) => ReactNode;
}) {
  const state = useAdminDataTableUrlState(tableId);
  return children(state);
}

export function AdminDataTable<TData>(props: AdminDataTableProps<TData>) {
  const persistUrl = props.persistUrl ?? true;
  if (!persistUrl) {
    return <AdminDataTableInner {...props} urlState={null} />;
  }
  return (
    <Suspense fallback={<AdminDataTableInner {...props} persistUrl={false} urlState={null} />}>
      <AdminDataTableUrlBridge tableId={props.tableId}>
        {(urlState) => <AdminDataTableInner {...props} urlState={urlState} />}
      </AdminDataTableUrlBridge>
    </Suspense>
  );
}

function AdminDataTableInner<TData>({
  tableId,
  data,
  columns,
  getRowId,
  eyebrow,
  title,
  description,
  searchPlaceholder,
  empty,
  emptyStateId,
  emptyFilterLabel = "No rows match your filter.",
  labels: labelsProp,
  footnote,
  pageSize = ADMIN_BOOKING_PAGE_SIZE,
  searchable = true,
  selectable = false,
  bulkActions,
  toolbar,
  summary,
  onRowClick,
  className,
  loading = false,
  loadingLabel,
  error,
  enableColumnVisibility = false,
  enableDensity = false,
  enablePageSize = false,
  stickyHeader = false,
  density: densityProp = "comfortable",
  persistPrefs,
  rowActions,
  urlState,
}: AdminDataTableProps<TData> & { urlState: AdminDataTableUrlState | null }) {
  const headingId = useId();
  const searchId = useId();
  const labels = mergeLabels(labelsProp);
  const persist = persistPrefs ?? (enableColumnVisibility || enableDensity || enablePageSize);
  const [prefs, updatePrefs] = useAdminDataTablePrefs(tableId, persist, densityProp);
  const density: AdminDataTableDensity = prefs.density;

  const [localQuery, setLocalQuery] = useState("");
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const [localPageIndex, setLocalPageIndex] = useState(0);
  const [localFilters, setLocalFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [localPageSize, setLocalPageSize] = useState(pageSize);

  const query = urlState?.query ?? localQuery;
  const sorting = urlState?.sorting ?? localSorting;
  const pageIndex = urlState?.pageIndex ?? localPageIndex;
  const columnFilters = urlState?.columnFilters ?? localFilters;

  const writeUrl = urlState?.write;

  const setQuery = (value: string) => {
    if (writeUrl) {
      writeUrl({ query: value, sorting, pageIndex: 0, columnFilters });
      return;
    }
    setLocalQuery(value);
    setLocalPageIndex(0);
  };

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    if (writeUrl) {
      writeUrl({ query, sorting: next, pageIndex: 0, columnFilters });
      return;
    }
    setLocalSorting(next);
    setLocalPageIndex(0);
  };

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next = typeof updater === "function" ? updater(columnFilters) : updater;
    if (writeUrl) {
      writeUrl({ query, sorting, pageIndex: 0, columnFilters: next });
      return;
    }
    setLocalFilters(next);
    setLocalPageIndex(0);
  };

  const onPaginationChange: OnChangeFn<{ pageIndex: number; pageSize: number }> = (updater) => {
    const current = { pageIndex, pageSize: localPageSize };
    const next = typeof updater === "function" ? updater(current) : updater;
    setLocalPageSize(next.pageSize);
    if (writeUrl) {
      writeUrl({ query, sorting, pageIndex: next.pageIndex, columnFilters });
      return;
    }
    setLocalPageIndex(next.pageIndex);
  };

  const selectionColumn = useMemo<ColumnDef<TData, unknown>[]>(
    () =>
      selectable
        ? [
            {
              id: "_select",
              enableHiding: false,
              enableSorting: false,
              enableGlobalFilter: false,
              enableColumnFilter: false,
              header: ({ table }) => (
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  indeterminate={table.getIsSomePageRowsSelected()}
                  aria-label={labels.selectAll}
                  onClick={(event) => event.stopPropagation()}
                  onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  aria-label={`${labels.selectRow} ${row.id}`}
                  onClick={(event) => event.stopPropagation()}
                  onCheckedChange={(checked) => row.toggleSelected(checked === true)}
                />
              ),
            },
          ]
        : [],
    [labels.selectAll, labels.selectRow, selectable],
  );

  const actionsColumn = useMemo<ColumnDef<TData, unknown>[]>(
    () =>
      rowActions
        ? [
            {
              id: "_actions",
              enableHiding: false,
              enableSorting: false,
              enableGlobalFilter: false,
              enableColumnFilter: false,
              header: () => <span className="sr-only">{labels.rowActions}</span>,
              cell: ({ row }) => (
                <AdminDataTableRowActions
                  row={row.original}
                  actions={rowActions(row.original)}
                  labels={labels}
                  rowName={row.id}
                />
              ),
            },
          ]
        : [],
    [labels, rowActions],
  );

  const tableColumns = useMemo(
    () => [...selectionColumn, ...columns, ...actionsColumn],
    [actionsColumn, columns, selectionColumn],
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter: query,
      rowSelection,
      columnFilters,
      columnVisibility: prefs.columnVisibility,
      pagination: { pageIndex, pageSize: localPageSize },
    },
    onSortingChange,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setQuery,
    onColumnFiltersChange,
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === "function" ? updater(prefs.columnVisibility) : updater;
      updatePrefs({ columnVisibility: next });
    },
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId,
    enableRowSelection: selectable,
    defaultColumn: {
      enableColumnFilter: false,
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
        return filterValue.includes(String(row.getValue(columnId) ?? ""));
      },
    },
    globalFilterFn: "includesString",
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const selectedRows = table.getSelectedRowModel().rows;
  const resolvedLoadingLabel = loadingLabel ?? `Loading ${labels.results}`;
  const emptyNode = resolveEmpty({
    dataLength: data.length,
    filteredCount,
    empty,
    emptyStateId,
    emptyFilterLabel,
  });

  return (
    <TooltipProvider>
      <section
        aria-labelledby={title ? headingId : undefined}
        className={cn("w-full text-foreground", className)}
        data-density={density}
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

        {(searchable || toolbar || title || eyebrow || description) &&
        (title || eyebrow || description) ? (
          <Separator className="my-5" />
        ) : null}

        <div
          className={cn("mb-3 flex flex-wrap items-center justify-between gap-3", !title && "mt-0")}
        >
          <AdminDataTableToolbar
            table={table}
            labels={labels}
            searchPlaceholder={searchPlaceholder ?? labels.search}
            searchable={searchable}
            searchId={searchId}
            query={query}
            onQueryChange={setQuery}
            toolbar={toolbar}
            enableColumnVisibility={enableColumnVisibility}
            enableDensity={enableDensity}
            density={density}
            onDensityChange={(next) => updatePrefs({ density: next })}
          />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{filteredCount}</span>{" "}
            {filteredCount === 1 ? labels.result : labels.results}
          </p>
        </div>

        {selectable && selectedRows.length > 0 ? (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground tabular-nums">
                {selectedRows.length} {labels.selected}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => table.resetRowSelection()}
              >
                {labels.clear}
              </Button>
            </div>
            {bulkActions?.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {bulkActions.map((action) => (
                  <Button
                    key={action.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => action.onClick(selectedRows.map((row) => row.original))}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {error ? (
            <div className="p-4">{error}</div>
          ) : loading ? (
            <TablePageSkeleton
              label={resolvedLoadingLabel}
              rows={Math.min(localPageSize, 8)}
              columns={tableColumns.length}
            />
          ) : (
            <>
              <div
                className={cn(
                  "overflow-x-auto",
                  stickyHeader && "max-h-[min(32rem,70vh)] overflow-y-auto",
                )}
              >
                <table className="w-full min-w-[36rem] border-separate border-spacing-0 text-left text-sm">
                  {title ? <caption className="sr-only">{title}</caption> : null}
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <AdminDataTableColumnHeader
                            key={header.id}
                            header={header}
                            sticky={stickyHeader}
                          />
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={tableColumns.length}
                          className="px-4 py-8 text-center text-sm text-muted-foreground"
                        >
                          {emptyNode}
                        </td>
                      </tr>
                    ) : (
                      table
                        .getRowModel()
                        .rows.map((row) => (
                          <DataRow
                            key={row.id}
                            row={row}
                            density={density}
                            onRowClick={onRowClick}
                          />
                        ))
                    )}
                  </tbody>
                </table>
              </div>
              <AdminDataTablePagination
                table={table}
                tableId={tableId}
                labels={labels}
                filteredCount={filteredCount}
                enablePageSize={enablePageSize}
              />
            </>
          )}
        </div>
        {footnote ? <p className="mt-3 text-[11px] text-muted-foreground">{footnote}</p> : null}
      </section>
    </TooltipProvider>
  );
}

function resolveEmpty({
  dataLength,
  filteredCount,
  empty,
  emptyStateId,
  emptyFilterLabel,
}: {
  dataLength: number;
  filteredCount: number;
  empty?: ReactNode;
  emptyStateId?: FeedbackStateId;
  emptyFilterLabel: string;
}) {
  if (filteredCount > 0) return null;
  if (dataLength === 0) {
    if (empty) return empty;
    if (emptyStateId) return <FeedbackState id={emptyStateId} />;
  }
  return emptyFilterLabel;
}

function DataRow<TData>({
  row,
  density,
  onRowClick,
}: {
  row: Row<TData>;
  density: AdminDataTableDensity;
  onRowClick?: (row: TData) => void;
}) {
  const selected = row.getIsSelected();
  const hasPrimaryLink = row
    .getVisibleCells()
    .some((cell) => Boolean(cell.column.columnDef.meta?.primaryLink?.(cell.row.original)));
  const interactive = Boolean(onRowClick) && !hasPrimaryLink;

  return (
    <tr
      data-state={selected ? "selected" : undefined}
      data-density={density}
      className={cn(
        "border-b border-border/60 transition-colors duration-200 ease-out last:border-b-0 hover:bg-muted/30 motion-reduce:transition-none data-[state=selected]:bg-muted",
        interactive ? "cursor-pointer" : null,
      )}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      onClick={interactive ? () => onRowClick?.(row.original) : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onRowClick?.(row.original);
              }
            }
          : undefined
      }
    >
      {row.getVisibleCells().map((cell) => {
        const href = cell.column.columnDef.meta?.primaryLink?.(cell.row.original);
        const content = flexRender(cell.column.columnDef.cell, cell.getContext());
        return (
          <td
            key={cell.id}
            className={cn(
              "px-2 align-middle first:pl-4 last:pr-4",
              density === "compact" ? "py-1" : "py-2",
            )}
          >
            {href ? (
              <Link
                href={href}
                className="underline underline-offset-4"
                onClick={(event) => event.stopPropagation()}
              >
                {content}
              </Link>
            ) : (
              content
            )}
          </td>
        );
      })}
    </tr>
  );
}
