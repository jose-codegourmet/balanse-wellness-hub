/**
 * Shared operational sales overview for Reports and Sales. Receives scoped
 * AdminReports and controlled date-range callbacks; never loads its own data.
 * Displays gross sales, refunds, net sales, occupancy, daily session revenue,
 * and every revenue-producing class in the class mix (without truncation).
 * Uses the shared DateRangePicker, including its current-date presets and
 * clear control. Clearing selects all report dates. Use behind the
 * appropriate report permissions; this is not a settlement-date ledger.
 */
import type { AdminReports } from "@balanse/domain";

export type ReportsOverviewProps = {
  reports: AdminReports;
  from: string;
  to: string;
  onRangeChange: (next: { from: string; to: string }) => void;
  hideTitle?: boolean;
};
