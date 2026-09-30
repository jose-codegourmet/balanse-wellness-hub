# Admin Portal — Payment accounts (Payment QR)

```text
PAYMENT ACCOUNTS                                   [+ Add account]
Shown at checkout: N · Hidden: N
(warning when accounts exist but none is shown)

Card per account
  QR preview (or "No QR — number only")
  Type: GCash | Maya | QR Ph     Shown at checkout / Hidden
  Name · Account name · Number [Copy]
  [Show to customers ◉]  [Edit]  [Remove]

Add / Edit dialog
  Type (GCash / Maya / QR Ph) + type hint
  Name · Account holder name
  GCash / Maya number (PH mobile, required) | Account number (QR Ph, optional)
  QR code (optional for GCash / Maya, required for QR Ph)
  Show to customers (switch)

Empty: "Add your first payment account" + Add account
```

Route: `/payment-qr` (nav label "Payment QR"). Sidebar: Operations, next to Payments. Permission: `settings.payment_qr.manage`.

- Full CRUD: add, edit, show / hide, remove (soft archive). Up to 12 accounts.
- Several accounts can be shown at once (e.g. GCash and Maya). There is no single "active QR" any more.
- Account name and number live on each account. The Settings "Payment info" tab and the single GCash name / number form are gone.
- Customer checkout (`/portal/bookings/[bookingId]/payment/gcash`, "Online payment") lists every shown account: type, name, account name, number, and QR when present.
- `PaymentInstructions.accounts` carries the shown accounts. `gcashName` / `gcashNumber` / `qrImageKey` remain for legacy readers, derived from the first shown account (and the first shown QR).
- Validation (`validatePaymentAccount`, shared by the form and the mock): GCash / Maya need a PH mobile number; QR Ph needs the QR image; account number is digits, spaces, or dashes.

Mock-only in this phase (`getMockAdapter()`). Server contract: `docs/backend/payment-qr-collection.md` (BE-056) — the `PaymentQrCode` model needs `type`, `accountName`, and `accountNumber` columns and a nullable image before wiring. Do not commit a live GCash, Maya, or QR Ph image.

Unrelated: marketing/contact `walk-in-qr` (`contact-b`).
