# Admin Portal — Transactions

## Purpose

Give active Super Admins one current-state financial history of the studio: every booking payment record, every refund in flight or completed, and every paid package purchase, with received / refunded / net totals that cover all records. It is operational history, not an accounting ledger or a receipt system; review and record payments on the Payments queue.

## Rough layout

```text
TRANSACTIONS                                    [Review payments]
[Total received] [Refunded] [Net received] [Pending records]
All records · Only completed payments and refunds affect totals.

[All transactions] [Payments] [Refunds] [Pending]
[Search customers, items, or references]   [Type ▾] [Method ▾] [Status ▾]
Customer | For | Type | Source created | Method | Status | Amount | Reference
...
Showing 50 of 123 records in this view.                      [Load more]
Dates show when the source booking or purchase was created, not when money moved.
```

## Data source (#378)

`GET /api/admin/transactions` through `adminTransactionsInfiniteQuery`. The server builds the ledger in one pass from `payments` (status other than `NONE`), `refunds` (`REFUND_PENDING` / `REFUNDED`), and `CUSTOMER_PAID` package acquisitions with a recorded payment, then applies the tab and the cursor. Totals are computed over every record before any filter, so they do not change with the tab, the table search, column facets, or paging. The page never reads the bookings queue.

## Rows and statuses

- **Booking payment** — `Completed` when the payment is `VERIFIED` or `CASH_RECEIVED` on a booking that is no longer held or waitlisted (the same rule as gross sales); `Rejected` for a rejected receipt; `Cancelled` when the booking is cancelled, expired, or rejected; otherwise `Pending`.
- **Refund** — `Completed` when `REFUNDED`, otherwise `Pending`. Shown as a negative amount; only completed refunds reduce Net received.
- **Package purchase** — `Completed` once approved (`APPROVED` / `ACTIVE`), `Rejected`, `Cancelled`, otherwise `Pending`.
- Package credit redemptions, free claims, admin grants, and unpaid waitlist entries never appear.
- The reference column shows the booking reference (`BWH-…`) or the package request id, and the customer name links to the booking or customer record.

## Behaviour

- `?tab=` selects the server-side view (`all`, `payments`, `refunds`, `pending`); the Pending tab is any record still waiting on review, cash, or a transfer.
- Pages are cursor-based (`sourceCreatedAt DESC, id DESC`, 50 rows); **Load more** appends the next page. Search and column facets filter the rows loaded so far.
- Dates are source creation times (booking reservation or package request). Settlement and refund transfer times are not shown.
- Payment, booking, refund, and package writes elsewhere in admin invalidate the ledger; realtime changes on `payments`, `bookings`, and package acquisitions refresh it.

## Access

- Route and nav: active Super Admin only (`superAdminOnly` with `payments.read`), checked before server prefetch.
- API: `payments.read`. Refund rows and refund totals are omitted for a caller without `refunds.read`.
- No Storybook story: the ledger has no mock data source (decision on #378, 2026-10-20).
