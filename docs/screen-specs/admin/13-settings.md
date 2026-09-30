# Admin Portal — Settings

```text
SETTINGS
BUSINESS PROFILE
Name | contact | address

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

GCash name / number are still stored on settings (`gcashName` / `gcashNumber`, the `payment` settings section and its permission), but Settings has no Payment tab. They are edited on `/payment-qr` next to the receive-QR collection (see `15-payment-qr.md`). Old `/settings?tab=payment` links redirect to `/payment-qr`. Customers see only the active QR plus those GCash fields — never labels or the archived set.

The legacy single `qrImageKey` is a **read-only derived** field pointing at the active row so existing payment-instruction screens keep working. Contract: `docs/backend/payment-qr-collection.md`.

Unrelated: the marketing/contact `walk-in-qr` asset (manifest id `contact-b`) is not a payment destination.

## Policies & waivers (mock)

- `/settings/policies` — policy library. Create, edit any version, promote a new version, delete a historical version, or delete a whole policy (all versions; detaches it from customer forms; past customer acceptances stay).
- `/settings/policies/new`, `/settings/policies/[policyId]` — policy editor.
- `/settings/policies/forms` — **Customer forms**. Attach existing policies to each customer-facing form and drag them into display order. Form fields themselves are fixed and not editable. Forms: sign up, class booking, package request, GCash payment proof, reschedule request, cancellation request, contact. Customers accept the current version of each attached policy before submitting (`AdminSettings.policyFormRequirements`, `getCustomerFormPolicies(form)`).
