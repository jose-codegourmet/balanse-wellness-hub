/**
 * Studio financial history for the Super Admin-only `/transactions` route.
 * Reads `GET /api/admin/transactions` through `adminTransactionsInfiniteQuery`:
 * one row per booking payment record, refund, and paid package purchase, with
 * server-computed received/refunded/net/pending totals that cover every record
 * regardless of tab, search, facet, or page. `?tab=` selects a server-side
 * view (all, payments, refunds, pending); search and column facets filter the
 * rows loaded so far, and "Load more" follows the cursor. Payment/refund rows
 * keep source creation dates; this is not a settlement-event ledger.
 * Use the Payments queue to review/record payments, not this read-only page.
 * No Storybook story: the ledger has no mock data source (#378 decision).
 */
export type TransactionsPageProps = Record<string, never>;
