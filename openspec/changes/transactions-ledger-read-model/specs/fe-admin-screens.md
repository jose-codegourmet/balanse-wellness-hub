# Delta: FE admin screens

Base: `openspec/specs/fe-admin-screens.md` (requirements 1–21). Already merged into the base on 2026-10-20; kept here as the change history.

## MODIFIED Requirements

13. Transactions (`/transactions`) keeps its Super Admin-only nav and route requirement. **It reads the transactions ledger API through `adminTransactionsInfiniteQuery`: `?tab=` is a server-side view (all, payments, refunds, pending), pages follow the cursor with Load more, and the table search and facets filter the rows loaded so far. The received/refunded/net/pending summaries come from the server and never change with the tab, search, facets, or page.** Exclusions and the source-creation date semantics are unchanged. **The screen has no Storybook story because the ledger has no mock data source; requirement 9 (Storybook retains the mock harness) still applies to every other screen.**
