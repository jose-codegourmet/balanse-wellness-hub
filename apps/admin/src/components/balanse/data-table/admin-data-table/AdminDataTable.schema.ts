import type { FeedbackStateId } from "@balanse/domain";
import type { ColumnDef, RowData } from "@tanstack/react-table";
import type { ReactNode } from "react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TanStack requires TValue on ColumnMeta
  interface ColumnMeta<TData extends RowData, TValue> {
    enableFaceting?: boolean;
    facetLabel?: string;
    primaryLink?: (row: TData) => string;
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
};
