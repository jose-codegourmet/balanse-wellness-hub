import type { FeedbackStateId } from "@balanse/domain";
import type { ColumnDef, RowData } from "@tanstack/react-table";
import type { ReactNode } from "react";

export type AdminDataTableMobileRole = "title" | "subtitle" | "meta" | "status" | "hidden";

export type AdminDataTableMobileMeta = {
  role: AdminDataTableMobileRole;
  order?: number;
};

export type AdminDataTableLayout = "auto" | "table" | "cards";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TanStack requires TValue on ColumnMeta
  interface ColumnMeta<TData extends RowData, TValue> {
    enableFaceting?: boolean;
    facetLabel?: string;
    primaryLink?: (row: TData) => string;
    /** Card-list placement below the tablet breakpoint. Omit to fall back to a labelled key/value row. */
    mobile?: AdminDataTableMobileMeta;
  }
}

export type AdminDataTableDensity = "comfortable" | "compact";

export type AdminDataTableLabels = {
  search: string;
  result: string;
  results: string;
  selected: string;
  clear: string;
  page: string;
  previous: string;
  next: string;
  pageSize: string;
  columns: string;
  density: string;
  densityComfortable: string;
  densityCompact: string;
  rowActions: string;
  selectAll: string;
  selectRow: string;
  filters: string;
  sort: string;
  sortAscending: string;
  sortDescending: string;
  sortNone: string;
  loadMore?: never;
};

export type AdminDataTableBulkAction<TData> = {
  id: string;
  label: string;
  onClick: (rows: TData[]) => void;
};

export type AdminDataTableRowAction<TData> = {
  id: string;
  label: string;
  href?: string;
  onClick?: (row: TData) => void;
  destructive?: boolean;
};

export type AdminDataTableProps<TData> = {
  tableId: string;
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId?: (row: TData, index: number) => string;
  eyebrow?: string;
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  empty?: ReactNode;
  emptyStateId?: FeedbackStateId;
  emptyFilterLabel?: string;
  labels?: Partial<AdminDataTableLabels>;
  footnote?: string;
  pageSize?: number;
  searchable?: boolean;
  selectable?: boolean;
  bulkActions?: AdminDataTableBulkAction<TData>[];
  toolbar?: ReactNode;
  summary?: ReactNode;
  onRowClick?: (row: TData) => void;
  className?: string;
  loading?: boolean;
  loadingLabel?: string;
  error?: ReactNode;
  enableColumnVisibility?: boolean;
  enableDensity?: boolean;
  enablePageSize?: boolean;
  stickyHeader?: boolean;
  density?: AdminDataTableDensity;
  persistUrl?: boolean;
  persistPrefs?: boolean;
  rowActions?: (row: TData) => AdminDataTableRowAction<TData>[];
  /**
   * `auto` uses `useBreakpoint()` at the tablet boundary (cards below 768).
   * Pin `table` or `cards` for Storybook and one-off screens.
   */
  layout?: AdminDataTableLayout;
};
