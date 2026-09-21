# PaymentQrPage — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Admin destination for QRs used to receive payment. Display the active QR large enough to scan, manage a small collection (one active), and keep Settings for GCash name/number only.

## When to use

- `/payment-qr` under Operations, next to Payments

## When NOT to use

- Payment review queue (`/payments`)
- Marketing/contact walk-in QR assets

## Examples

```tsx
<PaymentQrPage />
```

## Gotchas

- Mock-only: `getMockAdapter().listPaymentQrs` / `upsertPaymentQr` / `activatePaymentQr` / `archivePaymentQr`. No `/api/*`.
- `qrImageKey` on settings and payment instructions is derived from the active row.
- Cannot archive the active QR — activate another first (BE-056).
