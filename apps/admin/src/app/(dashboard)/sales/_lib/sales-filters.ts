import type { AdminReportFilters } from "@balanse/domain";

/** Align with the September mock reporting period. */
export const DEFAULT_SALES_FILTERS: AdminReportFilters = {
  from: "2026-09-01",
  to: "2026-09-30",
};
