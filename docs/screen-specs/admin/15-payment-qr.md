# Admin Portal — Payment QR

```text
PAYMENT QR
Active QR (large, scannable) + GCash name / number + copy
Collection: label, preview, Active/Inactive, set active, remove
Upload / replace (mock ImageUpload)
Empty: upload the first receive QR
```

Route: `/payment-qr`. Sidebar: Operations, next to Payments.

Operators show this page to a customer to collect payment. The collection holds many images and exactly one active row. Archive is blocked while a QR is active (activate a replacement first).

Mock-only in this phase (`getMockAdapter()`). Server contract: `docs/backend/payment-qr-collection.md` (BE-056). Do not commit a live GCash QR image.

Unrelated: marketing/contact `walk-in-qr` (`contact-b`).
