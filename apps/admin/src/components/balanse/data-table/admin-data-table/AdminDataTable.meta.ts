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
    /** Card-list placement when the table renders as cards (narrow or overflowing container). Omit to fall back to a labelled key/value row. */
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
   * `auto` is container-based, never viewport-based (the sidebar changes the content width):
   * cards when the table's own section is narrower than `cardsBelow`, or when the table would
   * scroll horizontally inside it; otherwise a table. See `useAdminDataTableLayout`.
   * Resizes are debounced (120ms) so a sidebar animation commits one re-render, and the
   * entering layout fades in (200ms, motion-safe).
   * Pin `table` or `cards` for Storybook and one-off screens.
   */
  layout?: AdminDataTableLayout;
  /** Container width (px) below which `auto` always renders cards. Defaults to 1024 (64rem). */
  cardsBelow?: number;
};
