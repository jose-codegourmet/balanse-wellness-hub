# Spec: Manual payments and refunds

## Requirements

1. A booking uses either `GCASH` or `PAY_AT_COUNTER` when it is not redeemed through an eligible package. Both methods share the booking hold deadline. Waitlisted customers do not pay merely to wait.
2. The GCash flow shows the studio's current account name, number and payment QR, then accepts image proof. Uploading proof changes the payment's review state, not the booking's confirmation. Authorized staff inspect the private proof by short-lived signed URL and may confirm or reject it.
3. Pay at Counter requires no screenshot. Authorized staff record received cash and then confirm the booking. The app does not process or verify the transfer itself; cash and GCash both require human review.
4. The studio can manage a labelled collection of payment-receive QRs. At most one non-archived QR is active. A newly created QR remains inactive after the first one; activation swaps the active row atomically. The active QR cannot be archived until another is activated. A payment snapshots the active QR on its first GCash proof submission, and later proof replacement does not rewrite that snapshot.
5. Payment proof, customer/staff avatars and other private media use controlled upload intents and signed reads. A confirmed public marketing/QR image may use a public URL. Upload confirmation verifies object key, type, size, intended actor and target; a client-supplied key alone is insufficient.
6. Refunds are performed outside the app and tracked as `NOT_APPLICABLE`, `REFUND_PENDING` or `REFUNDED`. Marking a refund state does not transfer money, replace the booking state, or erase the financial record. No-show has no refund. Cash refunds are not converted to package credits.
7. Paid package acquisition has a dedicated manual payment and review record. Package credits activate only after staff approval; see [session bundles](session-bundles.md). Booking payment and package acquisition are separate records.

## Scenarios

- **Proof review:** Given a held GCash booking, when its owner uploads proof, the booking awaits staff decision and does not become confirmed by upload alone.
- **QR history:** Given a GCash payment that snapped QR A, when staff activates QR B, the payment still identifies QR A for reconciliation.
- **Manual refund:** Given a paid cancelled booking, when staff marks its refund pending, the customer sees pending refund state without any claim that money was already returned.

## Surfaces and sources

- Customer: `/portal/bookings/[bookingId]/payment/**`, `/portal/packages/acquisitions/[acquisitionId]/payment/**`; `/api/payment-instructions`, `/api/bookings/{id}/payment-*`, `/api/packages/acquisitions/{id}/payment-*`.
- Staff: `/payments`, `/payment-qr`, `/transactions`; `/api/admin/payments`, `/refunds`, `/settings/payment-qrs`, `/package-acquisitions`.
- Detail: `docs/business-requirements/08-payment-rules.md`, `11-cancellations-and-refunds.md`, `docs/backend/payment-qr-collection.md`, `docs/backend/uploads.md`.
