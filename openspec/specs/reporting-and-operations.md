# Spec: Reporting and studio operations

## Requirements

1. The dashboard shows operational queue counts, today's sales and occupancy, and authorized coach cost in Manila time. Queue-depth history is not derivable without snapshots and must not display a made-up trend. Sensitive metrics are omitted for staff who lack the corresponding permission.
2. Payments, cancellations and reschedules have dedicated staff queues. Search accepts customer name or the stable booking reference `BWH-…`, filters before cursor pagination, and yields counts and empty states for the filtered set. Each queue action uses its underlying booking, payment or request permission.
3. Reports cover gross sales, refunds, net sales, coach cost, gross contribution, capacity/occupancy and attendance utilization. Gross sales exclude held and waitlisted reservations. Refunds include only actually refunded amounts. Coach cost uses each session assignment's captured rate; changing a coach default does not alter history.
4. Reporting windows are based on the session's `startsAt` in `Asia/Manila`, with half-open API windows. A coach filter may match any assigned coach without multiplying session revenue. Related revenue displayed per coach is not additive across coaches. No figure is labelled profit.
5. `/sales` and `/transactions` are restricted to active Super Admin actors on both navigation and direct route access. Sales shows aggregate operational reporting. Transactions show current-state booking payment/refund and paid self-purchase package records with source creation times; they are not an immutable accounting ledger or an official receipt system. The ledger is its own read model (`GET /api/admin/transactions`, `payments.read`): one row per payment record other than `NONE`, per refund in flight or completed, and per paid package purchase, never derived from the pending bookings queue. Received, refunded, net, and pending totals are computed server-side over every record before any tab, search, or page applies, so they do not change while filtering or paging. A booking payment counts as completed under the same rule as gross sales; only completed refunds reduce net. Refund rows and refund totals are omitted without `refunds.read`.
6. `/reports` and session drilldowns require their matching financial or capacity permission. Public and customer DTOs never contain coach compensation, cost or report data. `reports.marketing.read` gates aggregate marketing insights; its response contains counts only, not identities.
7. Admin customer, staff, coach, booking, event and package lists use authorized server queries with search/filter/pagination applied before presentation. Hiding a navigation item does not grant or revoke access. Coach-specific `My Students` data is scoped to the assigned coach; see [identity and onboarding](identity-and-onboarding.md).

## Scenarios

- **Unauthorized cost:** Given a Front Desk actor without coach-cost permission, when they request a dashboard or report payload, the coach-cost field is absent rather than merely hidden in the component.
- **Reference lookup:** Given a booking beyond the first queue page, when staff search its reference, filtering occurs before pagination and the result can be found.
- **Rate update:** Given historical sessions, when a coach's current rate changes, the reports continue to use each session's original snapshot.
- **Verified payment on the ledger:** Given a confirmed booking whose GCash payment was verified, when a Super Admin opens `/transactions`, that payment is listed as Completed and included in Total received, and a refund later recorded on the same booking appears under Refunds and reduces Net received.

## Surfaces and sources

- Admin: `/dashboard`, `/payments`, `/cancellations`, `/reschedules`, `/sales`, `/transactions`, `/reports/**`, `/marketing-insights`, `/customers/**`, `/students/**`.
- APIs: `/api/admin/dashboard`, `/api/admin/reports/**`, `/api/admin/transactions`, `/api/admin/marketing-insights`, `/api/admin/coach/students`.
- Detail: `docs/business-requirements/22-inventory-and-sales-reporting.md`, `docs/backend/reporting.md`, `docs/backend/dashboard-metrics.md`, `docs/backend/admin-pagination.md`.
