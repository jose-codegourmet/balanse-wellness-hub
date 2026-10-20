# Change: Transactions ledger read model (#378)

## Why

`/transactions` composed its rows on the client from `GET /api/admin/bookings`, which defaults to the `pending` tab (`HELD_AWAITING_PAYMENT`, `PAYMENT_SUBMITTED`) and returns one cursor page of eight rows. Confirmed, checked-in, cancelled, and refunded bookings never reached the page, so a booking payment could only ever show as Pending and vanished the moment it was verified. On 2026-10-20 production listed a single ₱5,000 package purchase while three verified GCash booking payments (₱1,000, ₱2,000, ₱550) were missing, and the "All records" totals were computed from that partial set.

## What

### Backend

- New `GET /api/admin/transactions` (`BE-378` in `routes.ts`, `payments.read` in `ADMIN_API_ACCESS`, handler `packages/api/src/handlers/admin-transactions.ts`). One request builds the whole ledger: `payments` with a status other than `NONE` (waitlisted bookings excluded), `refunds` in `REFUND_PENDING` / `REFUNDED`, and `CUSTOMER_PAID` bundle acquisitions with a recorded payment. Rows are `TransactionRecord`; the envelope is `CursorPage` plus `tab`, `sort`, and `totals` (`receivedPhp`, `refundedPhp`, `netPhp`, `pendingCount`).
- Totals are computed over every record before `tab`, `q`, and the cursor apply. `tab` is `all` | `payments` | `refunds` | `pending`; `q` matches customer name, booking reference, or description; the keyset sort is `sourceCreatedAt_desc_id_desc`, sliced in memory with the shared `sliceCursorPage`. A malformed cursor is the shared 400 `invalid_cursor`.
- Status rules live in `@balanse/domain` (`packages/domain/src/transactions.ts`): a booking payment is Completed under the `countsTowardGrossSales` rule, a refund is Completed only when `REFUNDED`, a package purchase once approved. Refund rows and refund totals are omitted without `refunds.read`.
- OpenAPI regenerated; the generator treats the route as a queue path with `tab` and `q` parameters.

### Admin (`apps/admin`)

- `TransactionsPage` reads `adminTransactionsInfiniteQuery` (`listAdminTransactions` in `@balanse/api-client`): the `?tab=` param is sent to the server, pages are 50 rows with a **Load more** control, totals come from the first page, and `page.tsx` prefetches the requested tab. Table search and type/method/status facets filter the rows loaded so far. The old `_lib/transaction-records.ts` composer is deleted.
- `adminKeys.transactions` is invalidated by booking, payment, refund, and package mutations and by realtime changes on `bookings`, `payments`, and package acquisitions.
- The Storybook story for the screen is removed: this branch adds no mock adapter or mock fetcher route for the ledger.

## Decisions (Jose, 2026-10-20)

- No mock work in this branch or for this ticket. The screen has no Storybook story until a non-mock data source exists; the Storybook mock harness for every other screen is unchanged.
- The `/transactions` route stays Super Admin only (route gate); the API is gated on `payments.read` like the payment queues, matching how `/sales` (route) and `/api/admin/reports/*` (API) are gated.
- Dates stay source creation times (booking reservation, package request). Settlement or refund transfer times are not surfaced.

## Out of scope

Server-side search wired to the table's search box (the API accepts `q`; the screen keeps the table's client search over loaded rows), a date-range filter on `/transactions`, exporting the ledger, and retiring `@balanse/mock` elsewhere.

## Validation

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`; `contract-coverage` and `be024-contract` tests.
- Manual, against today's production data: `/transactions` lists three Completed GCash booking payments plus the package purchase — Total received ₱8,550.00, Refunded ₱0.00, Net ₱8,550.00; marking a refund on a cancelled booking adds a Refunds row and reduces Net; switching tabs, searching, faceting, and loading more never change the totals.
