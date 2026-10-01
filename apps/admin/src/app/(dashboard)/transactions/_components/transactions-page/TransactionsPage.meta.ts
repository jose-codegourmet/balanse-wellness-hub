/**
 * Studio financial history, exclusively for active Super Admins. Uses existing
 * scoped mock booking, acquisition, and customer queries. Payment/refund rows
 * retain source creation dates; this is not a settlement-event ledger.
 * `?tab=` selects a shareable transaction view. Search and column facets filter
 * the table; summary figures cover all records.
 * Use the Payments queue to review/record payments, not this read-only page.
 */
export type TransactionsPageProps = {
  /** Preview the fully empty state without changing shared adapter fixtures. */
  empty?: boolean;
};
