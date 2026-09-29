/**
 * Super Admin's sales overview under Studio. Uses the scoped mock report query,
 * shared date-range overview, and responsive class/session sales tables.
 * Mount behind the shared /sales access rule. This is session-date operational
 * reporting, not a payment ledger or inventory/coach-cost report.
 */
export type SalesPageProps = {
  /** Override the fixture reporting window for previews, including empty ranges. */
  initialRange?: { from: string; to: string };
};
