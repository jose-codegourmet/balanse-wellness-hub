# Admin Portal — Settings

```text
SETTINGS
BUSINESS PROFILE
Name | contact | address

PAYMENT INFO
GCash name / number
Receive QR collection (many images, exactly one active)

PUBLIC CONTENT
About | Contact | FAQs

POLICIES / WAIVERS
Current versions
```

Do NOT expose reservation hold duration or booking cutoff; those remain developer-controlled.

## Financial privacy

Do not expose coach-rate visibility controls publicly.

If financial permissions are added later, they should remain restricted to authorized admin roles.

## Payment receive QRs (BE-056 / FE-ADM-040)

Settings hold **many** GCash receive QRs and **exactly one** active image. Admin can upload, label, switch active, and archive. Customers see only the active QR plus `gcashName` / `gcashNumber` — never labels or the archived set.

The legacy single `qrImageKey` is a **read-only derived** field pointing at the active row so existing payment-instruction screens keep working. Contract: `docs/backend/payment-qr-collection.md`.

Unrelated: the marketing/contact `walk-in-qr` asset (manifest id `contact-b`) is not a payment destination.
