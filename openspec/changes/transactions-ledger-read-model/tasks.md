# Tasks: Transactions ledger read model (#378)

Status: implemented on branch `fix/378-transactions-ledger` on 2026-10-20, not yet pushed. Unchecked items are follow-ups.

## BE

- [x] `packages/domain/src/transactions.ts`: `TransactionRecord`, `TransactionTotals`, `AdminTransactionsPage`, tab/status/search/sort/totals helpers; exported from the domain index.
- [x] `GET /api/admin/transactions` handler, router entry, `routes.ts` row (`BE-378`), `ADMIN_API_ACCESS` entry (`payments.read`), OpenAPI generator queue path + params, `openapi.json` regenerated.
- [x] `@balanse/api-client` `listAdminTransactions`.
- [x] `docs/backend/api-routes.md` section; `docs/backend/admin-pagination.md` rows.
- [ ] Verify on the hosted project after deploy that the three verified GCash payments and the package purchase total ₱8,550.00.

## FE — admin

- [x] `adminKeys.transactions`, `adminTransactionsInfiniteQuery`, barrel export; invalidation in `bookingPaymentDashboardKeys`, bundle mutations, and `AdminRealtimeSync`.
- [x] `TransactionsPage` reads the ledger API with server-side tabs and Load more; `page.tsx` prefetches the requested tab; `_lib/transaction-records.ts` deleted; meta updated.
- [x] `TransactionsPage.stories.tsx` removed (no mock data source for the ledger in this branch).
- [x] `docs/screen-specs/admin/23-transactions.md` (new) and `SCREEN_INDEX.md` entry; `apps/admin/src/lib/query/README.md` invalidation note.
- [ ] Decide how the screen gets a Storybook story without `@balanse/mock` (separate ticket).

## OpenSpec

- [x] Base specs updated: `reporting-and-operations.md` requirement 5, new scenario, API list; `fe-admin-screens.md` requirement 13; `openspec/README.md` API family and change-boundaries rows.

## Files in this change

Shared files (also touched by other in-flight changes; split with `git add -p` if needed): `packages/api/src/router.ts`, `packages/db/contracts/routes.ts`, `packages/db/contracts/openapi.json`, `packages/db/scripts/generate-openapi.ts`, `packages/domain/src/admin-access.ts`, `packages/domain/src/index.ts`, `packages/api-client/src/index.ts`, `apps/admin/src/lib/query/keys.ts`, `apps/admin/src/lib/query/queries.ts`, `apps/admin/src/lib/query/mutations/shared.ts`, `apps/admin/src/lib/query/mutations/bundles.ts`, `apps/admin/src/modules/realtime/AdminRealtimeSync.tsx`, `openspec/README.md`.

- `packages/domain/src/transactions.ts`
- `packages/api/src/handlers/admin-transactions.ts`
- `packages/api-client/src/transactions.ts`
- `apps/admin/src/lib/query/queries/transactions.ts`
- `apps/admin/src/app/(dashboard)/transactions/page.tsx`, `_components/transactions-page/TransactionsPage.tsx`, `TransactionsPage.meta.ts` (deletes `TransactionsPage.stories.tsx`, `_lib/transaction-records.ts`)
- `apps/admin/src/lib/query/README.md`
- `docs/backend/api-routes.md`, `docs/backend/admin-pagination.md`
- `docs/screen-specs/admin/23-transactions.md`, `docs/screen-specs/SCREEN_INDEX.md`
- `openspec/specs/reporting-and-operations.md`, `openspec/specs/fe-admin-screens.md`
- `openspec/changes/transactions-ledger-read-model/**`
