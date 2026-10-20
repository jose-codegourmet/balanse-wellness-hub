# Tasks: Session price floor and lock

Status: implemented in the working tree on 2026-10-20, not yet committed.

- [x] `FIELD_CONSTRAINTS` floors (`session.customerPrice.min`, `class.defaultCustomerPrice.min` = 1) and `price_locked` in `VALIDATION_ERROR_CODES`.
- [x] `PAID_BOOKING_STATUSES`, `bookingHasPaid`, `sessionPriceLocked`, `SESSION_PRICE_LOCKED_MESSAGE` in `@balanse/domain`.
- [x] `moneyValue(..., min)`; session POST/PATCH and class parse use the floors; PATCH 422 `price_locked` inside the session transaction.
- [x] api-client `createSession` / `patchSession` map `customerPrice` field errors to `pricePhp`.
- [x] Session form schema message; `SessionFormPage` lock UI (disabled field, paid count, no reset, class change keeps a locked price).
- [x] Mock adapter `upsertSession` throws `SESSION_PRICE_LOCKED_MESSAGE`; stories.
- [x] `docs/backend/validation-contracts.md`, base spec `catalogue-and-scheduling.md`.
- [ ] `docs/screen-specs/admin/` session editor page: locked-price state.

## Files in this change

Shared files (also touched by other changes; split with `git add -p`): `packages/domain/src/contracts.ts` (`FIELD_CONSTRAINTS` price floors, `price_locked`), `packages/domain/src/admin.ts` (paid-status helpers), `packages/api/src/handlers/admin-catalogue.ts` (price parsing and lock), `packages/mock/src/memory-adapter.ts` (`upsertSession` guard), `docs/backend/validation-contracts.md`, `openspec/specs/catalogue-and-scheduling.md`, `openspec/README.md`.

- `packages/api/src/validation.ts`
- `packages/api-client/src/sessions.ts`
- `apps/admin/src/modules/admin/forms/session/session-form.schema.ts`
- `apps/admin/src/app/(dashboard)/schedule/_components/session-form-page/SessionFormPage.tsx`
- `apps/admin/src/app/(dashboard)/schedule/_components/session-form-page/SessionFormPage.stories.tsx`
