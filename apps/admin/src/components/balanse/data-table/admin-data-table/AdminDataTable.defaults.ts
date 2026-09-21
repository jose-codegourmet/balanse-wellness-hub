import { ADMIN_BOOKING_PAGE_SIZE } from "@balanse/domain";

import type { AdminDataTableLabels, AdminDataTableProps } from "./AdminDataTable.schema";

export const ADMIN_DATA_TABLE_PAGE_SIZES = [ADMIN_BOOKING_PAGE_SIZE, 10, 25, 50] as const;

export const adminDataTableDefaultLabels: AdminDataTableLabels = {
  search: "Search",
  result: "result",
  results: "results",
  selected: "selected",
  clear: "Clear",
  page: "Page",
  previous: "Previous page",
  next: "Next page",
  pageSize: "Rows per page",
  columns: "Columns",
  density: "Density",
  densityComfortable: "Comfortable",
  densityCompact: "Compact",
  rowActions: "Row actions",
  selectAll: "Select all rows on this page",
  selectRow: "Select row",
  filters: "Filters",
  sort: "Sort",
  sortAscending: "Ascending",
  sortDescending: "Descending",
  sortNone: "Clear sort",
};

export const adminDataTableDefaultValues: Partial<AdminDataTableProps<unknown>> = {
  tableId: "example",
  pageSize: ADMIN_BOOKING_PAGE_SIZE,
  searchable: true,
  density: "comfortable",
  persistUrl: false,
  layout: "auto",
  emptyFilterLabel: "No rows match your filter.",
};
