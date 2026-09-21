"use client";

import { ADMIN_BOOKING_PAGE_SIZE, type FeedbackStateId } from "@balanse/domain";
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  cn,
  FeedbackState,
  Separator,
  TablePageSkeleton,
  TooltipProvider,
  useIsMobile,
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
  AdminDataTableLayout,
  AdminDataTableMobileRole,
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
  AdminDataTableLayout,
  AdminDataTableMobileMeta,
  AdminDataTableMobileRole,
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
  layout = "auto",
  urlState,
}: AdminDataTableProps<TData> & { urlState: AdminDataTableUrlState | null }) {
  const headingId = useId();
  const searchId = useId();
  const labels = mergeLabels(labelsProp);
  const persist = persistPrefs ?? (enableColumnVisibility || enableDensity || enablePageSize);
  const [prefs, updatePrefs] = useAdminDataTablePrefs(tableId, persist, densityProp);
  const density: AdminDataTableDensity = prefs.density;
  const isMobile = useIsMobile();
  const cardMode = resolveCardMode(layout, isMobile);

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
                  touch={cardMode}
                />
              ),
            },
          ]
        : [],
    [cardMode, labels, rowActions],
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

        {loading ? null : (
          <div
            className={cn(
              "mb-3 flex flex-wrap items-center justify-between gap-3",
              !title && "mt-0",
            )}
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
              enableDensity={enableDensity && !cardMode}
              density={density}
              onDensityChange={(next) => updatePrefs({ density: next })}
              compact={cardMode}
            />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{filteredCount}</span>{" "}
              {filteredCount === 1 ? labels.result : labels.results}
            </p>
          </div>
        )}

        {selectable && selectedRows.length > 0 && !loading ? (
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

        {loading ? (
          <TablePageSkeleton
            label={resolvedLoadingLabel}
            rows={Math.min(localPageSize, cardMode ? 6 : 8)}
            columns={tableColumns.length}
            layout={cardMode ? "cards" : "table"}
            chrome="content"
          />
        ) : cardMode ? (
          <div>
            {error ? (
              <div className="rounded-xl border border-border bg-card p-4">{error}</div>
            ) : table.getRowModel().rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4">{emptyNode}</div>
            ) : (
              <ul className="space-y-4">
                {table.getRowModel().rows.map((row) => (
                  <li key={row.id}>
                    <DataCard
                      row={row}
                      labels={labels}
                      selectable={selectable}
                      onRowClick={onRowClick}
                    />
                  </li>
                ))}
              </ul>
            )}
            {error ? null : (
              <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
                <AdminDataTablePagination
                  table={table}
                  tableId={tableId}
                  labels={labels}
                  filteredCount={filteredCount}
                  enablePageSize={enablePageSize}
                  thumbFriendly
                />
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {error ? (
              <div className="p-4">{error}</div>
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
        )}
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

function resolveCardMode(layout: AdminDataTableLayout, isMobile: boolean): boolean {
  if (layout === "cards") return true;
  if (layout === "table") return false;
  return isMobile;
}

function headerLabelFromCell(cell: {
  column: { id: string; columnDef: { header?: unknown } };
}): string {
  return typeof cell.column.columnDef.header === "string"
    ? cell.column.columnDef.header
    : cell.column.id;
}

function DataCard<TData>({
  row,
  labels,
  selectable,
  onRowClick,
}: {
  row: Row<TData>;
  labels: AdminDataTableLabels;
  selectable: boolean;
  onRowClick?: (row: TData) => void;
}) {
  const selected = row.getIsSelected();
  const dataCells = row
    .getVisibleCells()
    .filter((cell) => cell.column.id !== "_select" && cell.column.id !== "_actions");
  const grouped = dataCells
    .map((cell, index) => {
      const mobile = cell.column.columnDef.meta?.mobile;
      return {
        cell,
        role: (mobile?.role ?? "meta") as AdminDataTableMobileRole,
        order: mobile?.order ?? index,
      };
    })
    .filter((item) => item.role !== "hidden")
    .sort((a, b) => a.order - b.order);

  const title = grouped.find((item) => item.role === "title") ?? grouped[0];
  const subtitle = grouped.find((item) => item.role === "subtitle");
  const statuses = grouped.filter((item) => item.role === "status");
  const metas = grouped.filter(
    (item) =>
      item.role === "meta" && item.cell.id !== title?.cell.id && item.cell.id !== subtitle?.cell.id,
  );

  const titleHref = title?.cell.column.columnDef.meta?.primaryLink?.(row.original);
  const titleContent = title
    ? flexRender(title.cell.column.columnDef.cell, title.cell.getContext())
    : row.id;
  const interactive = Boolean(onRowClick) && !titleHref;

  return (
    <Card
      data-slot="admin-data-table-card"
      data-state={selected ? "selected" : undefined}
      className={cn(selected && "ring-2 ring-primary/40")}
    >
      <CardHeader className="border-b">
        <div className="flex min-w-0 items-start gap-3">
          {selectable ? (
            <Checkbox
              checked={row.getIsSelected()}
              aria-label={`${labels.selectRow} ${row.id}`}
              className="mt-1 size-5"
              onClick={(event) => event.stopPropagation()}
              onCheckedChange={(checked) => row.toggleSelected(checked === true)}
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base leading-snug">
              {titleHref ? (
                <Link
                  href={titleHref}
                  className="flex min-h-11 items-center underline underline-offset-4"
                >
                  {titleContent}
                </Link>
              ) : interactive ? (
                <button
                  type="button"
                  className="min-h-11 text-left underline underline-offset-4"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {titleContent}
                </button>
              ) : (
                titleContent
              )}
            </CardTitle>
            {subtitle ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {flexRender(subtitle.cell.column.columnDef.cell, subtitle.cell.getContext())}
              </p>
            ) : null}
          </div>
        </div>
        {statuses.length || row.getVisibleCells().some((cell) => cell.column.id === "_actions") ? (
          <CardAction className="flex items-center gap-2">
            {statuses.map((item) => (
              <div key={item.cell.id}>
                {flexRender(item.cell.column.columnDef.cell, item.cell.getContext())}
              </div>
            ))}
            {(() => {
              const actionsCell = row
                .getVisibleCells()
                .find((cell) => cell.column.id === "_actions");
              return actionsCell
                ? flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())
                : null;
            })()}
          </CardAction>
        ) : null}
      </CardHeader>
      {metas.length ? (
        <CardContent className="grid gap-2">
          {metas.map((item) => (
            <div key={item.cell.id} className="grid gap-0.5">
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {headerLabelFromCell(item.cell)}
              </p>
              <div className="text-sm text-foreground">
                {flexRender(item.cell.column.columnDef.cell, item.cell.getContext())}
              </div>
            </div>
          ))}
        </CardContent>
      ) : null}
    </Card>
  );
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
