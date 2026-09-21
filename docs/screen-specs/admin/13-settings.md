# Admin Portal — Settings

```text
SETTINGS
BUSINESS PROFILE
Name | contact | address

PAYMENT INFO
GCash name / number
Link to /payment-qr for receive QR collection

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

Settings keep `gcashName` / `gcashNumber` only. The receive-QR collection lives on `/payment-qr` (see `15-payment-qr.md`). Customers see only the active QR plus those GCash fields — never labels or the archived set.

The legacy single `qrImageKey` is a **read-only derived** field pointing at the active row so existing payment-instruction screens keep working. Contract: `docs/backend/payment-qr-collection.md`.

Unrelated: the marketing/contact `walk-in-qr` asset (manifest id `contact-b`) is not a payment destination.
