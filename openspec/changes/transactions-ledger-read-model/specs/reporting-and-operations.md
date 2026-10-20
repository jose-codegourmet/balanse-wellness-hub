# Delta: Reporting and studio operations

Base: `openspec/specs/reporting-and-operations.md` (requirements 1–7). Already merged into the base on 2026-10-20; kept here as the change history.

## MODIFIED Requirements

5. `/sales` and `/transactions` remain Super Admin only on navigation and direct route access. **Transactions are served by a dedicated read model, `GET /api/admin/transactions` (`payments.read`), built from payment records other than `NONE`, refunds in flight or completed, and paid package purchases, never from the pending bookings queue. Received, refunded, net, and pending totals are computed server-side over every record before any tab, search, or page applies. A booking payment is completed under the gross-sales rule; only completed refunds reduce net. Refund rows and refund totals are omitted without `refunds.read`.** Dates remain source creation times; the screen is not an immutable accounting ledger.

## ADDED Scenarios

- **Verified payment on the ledger:** Given a confirmed booking whose GCash payment was verified, when a Super Admin opens `/transactions`, that payment is listed as Completed and included in Total received, and a refund later recorded on the same booking appears under Refunds and reduces Net received.

## Routes

- adds `GET /api/admin/transactions` (`tab`, `q`, `limit`, `cursor`; `CursorPage` + `totals`)
