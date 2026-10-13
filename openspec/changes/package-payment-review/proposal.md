# Change: Paid package payment flow and review queue (#290 / #301 / BE-058)

## Why

A customer could request a paid package, but the only payment screen was a bare form at `/portal/packages/acquisitions/[acquisitionId]/payment` that did not match the booking payment experience, and staff reviewed requests on `/bundles` by raw `profileId` with no receipt to look at. Paid packages therefore could not be approved with confidence, and the dashboard and inbox did not count them as work waiting.

## What

### Customer (`apps/web`)

- `/portal/packages/acquisitions/[acquisitionId]/payment` now mirrors the booking payment screen: header band (package name, sessions, validity, amount due), the shared `PaymentMethodForm` with `context="package"`, and a side card explaining that there is no hold and that the studio activates the sessions. GCash continues to `/gcash`; Pay at Counter returns to **My packages** with the `package.counter-selected` toast.
- `/portal/packages/acquisitions/[acquisitionId]/payment/gcash` is a three-step wizard (`AcquisitionGcashWizard`): send payment → upload receipt → studio review, the same shape as the booking GCash wizard. Uploading a proof records `payment_proof` policy acceptances against the acquisition id and shows `package.proof-submitted`. It starts on the review step when a proof already exists.
- `loadAcquisitionPayment()` resolves the request server-side: approved requests render `AcquisitionPaymentEndState` (link to the new package); rejected, cancelled or unknown requests render the closed state; a `PENDING_REVIEW` request redirects to the GCash review step.
- **My packages** shows "Continue payment" / "View payment status" links on pending paid requests and falls back to the catalogue price when no payment amount is stored yet.
- The booking GCash wizard and payment method page were refactored so the booking and package flows share one set of components under `src/components/balanse/payment/`: `PaymentMethodForm`, `PaymentProofForm`, `GcashPayStep` (QR, account switcher, copyable details, full-screen QR lightbox) and `PaymentStepper`.
- A held booking covered by a package credit reads "Reserved — Package Applied" (`PACKAGE_HELD_STATUS_LABEL`) with a no-payment message instead of "Reserved — Payment Needed". The customer booking DTO now carries `entitlementId`, `packageName`, `intendedEntitlementId`, `packagePromotionBlocked` and the latest `redemption`.

### Staff (`apps/admin`)

- `/payments` gains a **Packages** tab (`PackagePaymentQueue`), visible with `bundles.read` or `bundles.manage`. It lists `CUSTOMER_PAID` acquisitions that are `PENDING_REVIEW` (receipt submitted) or `PENDING_PAYMENT` with `PAY_AT_COUNTER`, receipts first then oldest first, searchable by customer name, email or package name. Actions (`bundles.manage`): **Approve payment**, **Reject receipt** (with reason) and **Cash received**; approval activates the package.
- Receipts render through the extracted `PaymentProofDialog` (thumbnail + fit-to-viewport zoom), fed by a short-lived signed URL.
- `/bundles` no longer hosts an inline approve/reject list; its review section states the pending count and links to `/payments?tab=packages`.
- Dashboard attention cards and the notification inbox add a **Package payments** count (`attention.packagePayments`), shaped by `bundles.read` / `bundles.manage` like the other counts.
- Bundle create/edit sends `status` through the audited status endpoints rather than the create/patch body.

### Backend

- `GET /api/admin/package-acquisitions` returns `AdminBundleAcquisition` rows with `customerName`, `customerEmail` and `bundleName`.
- New `GET /api/admin/package-acquisitions/{id}/proof-signed-url` (`bundles.manage`): 120-second signed URL from the private `payment-proofs` bucket, audited as `bundle.payment.proof.signed_url` per view; 404 `proof_not_found` when nothing is stored.
- `GET /api/admin/dashboard` adds `attention.packagePayments` (count of `bundle_acquisitions` in `PENDING_REVIEW`).
- Migration `20261013180000_realtime_bundle_acquisitions` adds `bundle_acquisitions` and `bundle_acquisition_payments` to the `supabase_realtime` publication; `AdminRealtimeSync` invalidates bundle, customer and dashboard scopes on those tables.

## Decisions (Jose, 2026-10-13)

- Package review lives in **Payments**, next to booking payments, not on the bundle catalogue page. The catalogue keeps a count and a link only.
- Receipts are reviewer-only and fetched by audited signed URL, exactly like booking proofs. No public URL for a receipt.
- Choosing a method, uploading a proof and recording cash never activate a package; only staff approval does.
- Package requests have no hold or deadline; the customer copy must not mention one.
- Customer copy says "package"; admin and code may say "bundle".

## Out of scope

Automatic expiry of unpaid package requests, refunds on packages, customer-initiated cancellation of a pending request, and the `/transactions` ledger shape (unchanged; it already reads the shared acquisitions cache).

## Validation

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`, `pnpm secrets:scan`
- Manual: request a paid package → choose GCash → upload receipt → approve in `/payments?tab=packages` → package appears in `/portal/packages`; same with Pay at Counter → **Cash received**; reject with reason → customer sees the closed state; Front Desk without `bundles.manage` sees the tab without actions.
