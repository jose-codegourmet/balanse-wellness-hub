# Tasks: Paid package payment flow and review queue

Status: implemented in the working tree on 2026-10-13, not yet committed. Unchecked items are follow-ups.

## BE

- [x] `AdminBundleAcquisition` DTO (`customerName`, `customerEmail`, `bundleName`) on `GET /api/admin/package-acquisitions`.
- [x] `GET /api/admin/package-acquisitions/{id}/proof-signed-url` — `bundles.manage`, 120 s, audited `bundle.payment.proof.signed_url`, 404 `proof_not_found`. Contract row in `routes.ts` (BE-058), `ADMIN_API_ACCESS` entry, OpenAPI regenerated.
- [x] Dashboard `attention.packagePayments` in the SQL snapshot and `shapeDashboard` (shaped by `bundles.read` / `bundles.manage`).
- [x] Customer booking DTO: `entitlementId`, `packageName`, `intendedEntitlementId`, `packagePromotionBlocked`, `redemption` (latest non-restored redemption wins).
- [x] Migration `realtime_bundle_acquisitions` (Prisma + `supabase/migrations`), idempotent and a no-op on plain Postgres.
- [ ] `docs/backend/session-bundles.md` §HTTP contracts: add the proof-signed-url route and the admin DTO fields.
- [ ] `docs/backend/dashboard-metrics.md`: add `packagePayments`.

## FE — customer

- [x] Shared payment components under `apps/web/src/components/balanse/payment/`: `PaymentMethodForm` (+ `context`), `PaymentProofForm`, `GcashPayStep`, `PaymentStepper`; booking wizard and method page consume them.
- [x] `AcquisitionPaymentPage`, `AcquisitionPaymentEndState`, `AcquisitionGcashWizard`, `loadAcquisitionPayment`, `summary-labels`; old `AcquisitionPaymentForm` removed.
- [x] `/gcash` route for acquisitions; `page.tsx` redirects `PENDING_REVIEW` there.
- [x] My packages: continue / view-status links, catalogue price fallback.
- [x] `PACKAGE_HELD_STATUS_LABEL` and `BookingStatusBanner` package-held presentation + story.
- [x] Toast ids `package.counter-selected`, `package.proof-submitted`.
- [ ] `docs/screen-specs/shared/02-status-language.md`: add "Reserved — Package Applied".
- [ ] `docs/screen-specs/customer/14-packages.md` / `19-packages.md`: describe the payment and GCash steps and the end states.

## FE — admin

- [x] `PackagePaymentQueue` (+ `usePackagePaymentRows`, `packagePaymentRows`) and `PaymentProofDialog` extracted from `PaymentPages`.
- [x] `/payments` Packages tab, search copy, tab counts, `PackagesQueue` story.
- [x] `/bundles` review section → count + "Open package payments" link.
- [x] Dashboard card and `AdminNotificationHeader` entry for package payments; sidebar story data updated.
- [x] `AdminQueueCard` accepts `badge` for non-booking queues.
- [x] Query layer: `adminKeys.bundles.proofUrl`, `adminPackageProofUrlQuery`, bundle mutations invalidate the dashboard; `useUpsertAdminBundle` applies `status` via the status endpoints.
- [x] `AdminRealtimeSync` watches `bundle_acquisitions` / `bundle_acquisition_payments`.
- [x] Storybook: `mock-entity-fetcher` serves admin acquisition rows with customer/package names, payment records and the proof-signed-url route; mock `scopeDashboardSnapshot` and memory adapter carry `packagePayments`.
- [ ] `docs/screen-specs/admin/09-payment-review.md`: add the Packages tab; `16-bundle-management.md`: remove the inline review list.

## Files in this change

Shared files (also touched by other changes; split with `git add -p`): `packages/api/src/router.ts`, `packages/db/contracts/routes.ts`, `packages/db/contracts/openapi.json`, `packages/domain/src/admin-access.ts`, `packages/domain/src/toast-copy.ts`.

- `apps/web/src/app/(portal)/portal/packages/acquisitions/[acquisitionId]/payment/**` (page, `_components/`, `_lib/`, `gcash/`; deletes `_components/acquisition-payment-form/`)
- `apps/web/src/app/(portal)/portal/packages/_components/my-packages-page/MyPackagesPage.tsx`
- `apps/web/src/components/balanse/payment/**` (moved `payment-method-form/`, `payment-proof-form/`, `payment-qr-lightbox.css`; new `gcash-pay-step/`, `payment-stepper/`)
- `apps/web/src/app/(portal)/portal/bookings/[bookingId]/payment/_components/payment-method-page/PaymentMethodPage.tsx`
- `apps/web/src/app/(portal)/portal/bookings/[bookingId]/payment/gcash/_components/gcash-payment-wizard/GcashPaymentWizard.tsx`
- `apps/web/src/components/balanse/portal/booking-status-banner/*`
- `apps/admin/src/app/(dashboard)/payments/_components/**`
- `apps/admin/src/app/(dashboard)/bundles/_components/bundle-list-page/BundleListPage.tsx`, `bundle-form-page/BundleFormPage.tsx`
- `apps/admin/src/app/(dashboard)/dashboard/_components/dashboard-page/DashboardPage.tsx`
- `apps/admin/src/components/balanse/admin-notification-header/AdminNotificationHeader.tsx`
- `apps/admin/src/components/balanse/queue/admin-queue-card/*`
- `apps/admin/src/components/balanse/sidebar/admin-sidebar-nav/AdminSidebarNav.stories-data.ts`
- `apps/admin/src/lib/query/keys.ts`, `queries/bundles.ts`, `mutations/bundles.ts`
- `apps/admin/src/modules/realtime/AdminRealtimeSync.tsx`
- `apps/admin/.storybook/mock-entity-fetcher.ts`
- `packages/api/src/handlers/admin-bundles.ts`, `admin-dashboard.ts`, `bookings.ts`, `packages/api/src/sensitive.ts`
- `packages/api-client/src/packages.ts`
- `packages/domain/src/bundles.ts`, `admin.ts`, `status-language.ts`
- `packages/mock/src/authorize.ts`, `memory-adapter.ts`
- `packages/db/prisma/migrations/20261013180000_realtime_bundle_acquisitions/`, `supabase/migrations/20261013180000_realtime_bundle_acquisitions.sql`
