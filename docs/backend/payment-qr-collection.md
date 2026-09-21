# Payment-receive QR collection (BE-056)

Extends **BE-052** (signed upload) and **BE-053** (settings PATCH). Amends **BE-010** / **BE-033** (optional payment snapshot), **BE-043** (settings GET), **BE-020** / **BE-021** (RLS + public read). FE counterpart: `FE-ADM-040`. Parent epic: #260.

This is a **contract + schema** ticket. Screens stay mock-only — no `fetch` to `/api/*`.

## Why a table, not a JSON array

`AppMeta.public_settings.payment` held one nullable key (`gcashQrObjectKey`). A structured array in that blob cannot be referenced by `payments` without duplicating the image key (and losing identity when the blob is rewritten).

`payment_qr_codes` is a real table so a payment can snapshot **which QR was live**.

Rejected: keep a single-slot key, or store `{ qrs: [...] }` inside `app_meta`.

## Model

```text
PaymentQrCode
  id          cuid
  label       string
  imageKey    string  @unique
  isActive    boolean
  archivedAt  timestamptz?
  createdAt / updatedAt
  payments    Payment[]
```

Server-enforced single-active invariant:

```sql
CREATE UNIQUE INDEX payment_qr_codes_one_active
  ON payment_qr_codes ((true))
  WHERE "isActive" = true AND "archivedAt" IS NULL;
```

Also `CHECK (archivedAt IS NULL OR isActive = false)`.

Zero active rows is allowed only while the collection is empty (seed / pre-upload). After the first confirm, removing the active row is 422 — activate another first.

Non-archived rows are capped at **12** (`FIELD_CONSTRAINTS.settings.paymentQr.maxItems`). Archived rows do not count.

## Snapshot decision: **yes**

`payments.paymentQrCodeId` is a nullable FK (`ON DELETE SET NULL`).

| Rule | Why |
| --- | --- |
| Set on **first** GCash proof submit | Reconcile which GCash QR / account was shown. |
| Later proof re-uploads do **not** rewrite it | The original destination should stay attached to that payment. |
| Existing rows stay `null` | Pre-collection history has no QR identity. |
| Archive does not delete the image | Snapshot + audit still resolve `imageKey`. |

Cash / pay-at-counter payments do not snapshot a QR.

Handler change is backend-only (amends BE-033). No FE wiring.

## HTTP contract (admin)

All writes: active admin. 422 = BE-051 `validation_failed`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/settings/payment-qrs` | List. `?includeArchived=true` includes archived. |
| `POST` | `/api/admin/settings/payment-qrs` | Mint (`{ contentType }`) or confirm (`{ objectKey, label }`). |
| `PATCH` | `/api/admin/settings/payment-qrs/{id}` | Update `label` only. |
| `POST` | `/api/admin/settings/payment-qrs/{id}/activate` | Atomic swap (`isActive`). |
| `DELETE` | `/api/admin/settings/payment-qrs/{id}` | Archive (`archivedAt`). Image kept. |

Create follows BE-052: mint signed upload → client PUT → confirm with `objectKey`. First live QR auto-activates. Later creates stay inactive until `activate`.

`POST …/activate` turns other live rows `isActive = false` in one transaction (does **not** archive them).

### 4xx

| Case | Status | Code / path |
| --- | --- | --- |
| Missing `contentType` / `label` / `objectKey` | 422 | `required` |
| Bad MIME | 422 | `invalid_format` on `contentType` |
| More than 12 non-archived | 422 | `qr_limit` on `paymentQrs` |
| QR not found / already archived | 404 | `payment_qr_not_found` |
| Activate archived | 422 | `inactive_reference` |
| Archive the active QR | 422 | `cannot_remove_active` |
| Reuse an archived image key | 422 | `duplicate_value` on `objectKey` |

Audit: `payment_qr.create`, `payment_qr.update`, `payment_qr.activate`, `payment_qr.archive`.

## Legacy single-slot routes (BE-052 compatibility)

| Route | New behaviour |
| --- | --- |
| `POST /api/admin/settings/qr` | Still mint/confirm. Confirm **creates** a collection row (label default `GCash`), activates it, and **archives** the previous active row. Previous **object is not deleted**. |
| `DELETE /api/admin/settings/qr` | **422** `cannot_remove_active` — use the collection after activating a replacement. |
| `PATCH /api/admin/settings` `payment.gcashQrObjectKey` / `qrImageKey` | **422** `read_only`. |

## Derived `qrImageKey`

During transition, settings JSON `payment.gcashQrObjectKey` / `gcashQrPublicUrl` stay as **read-only derived** copies of the active row. `GET /api/payment-instructions` overlays the active table row (falls back to the JSON key if the table is empty). Customer-facing payment instructions keep working.

Admin `GET /api/admin/settings` adds:

```json
{
  "payment": {
    "gcashAccountName": "…",
    "gcashNumber": "…",
    "gcashQrObjectKey": "<active imageKey or \"\">",
    "gcashQrPublicUrl": "…",
    "qrImageKey": "<same as object key or null>",
    "qrs": [{ "id", "label", "imageKey", "isActive", "createdAt", "updatedAt", "archivedAt" }]
  }
}
```

## Public / customer read

Unauthenticated Data API: view `payment_qr_codes_public` (`id`, `imageKey`, `isActive` of the single active row). **No labels. No archived set.**

Customer `GET /api/payment-instructions` (existing, authenticated):

```json
{
  "method": "GCASH",
  "accountName": "…",
  "number": "…",
  "qrObjectKey": "…",
  "qrPublicUrl": "…"
}
```

Never returns the collection, labels, or archived ids.

Public `GET /api/public/content` still has **no** GCash fields (unchanged).

## Storage

| Item | Value |
| --- | --- |
| Bucket | `marketing-assets` (public read, admin write) |
| Key | `marketing-assets/settings/gcash-qr/<uuid>.<ext>` |
| MIME | `SIGNED_UPLOAD.gcashQrTypes`: jpeg / png / webp / gif |
| Max | `SIGNED_UPLOAD.maxBytes` = 5 MiB (bucket allows 10 MiB) |
| Purpose (pending_uploads) | `gcash_qr` (legacy single-slot and collection mint) |

### Orphan cleanup

- Unconfirmed mints: existing `pending_uploads` + `reap_pending_uploads` (24h).
- Replaced / archived **confirmed** images are **kept** so `payments.paymentQrCodeId` still resolves.
- Follow-up (not this ticket): sweep archived objects with zero payment references.

Amendment to BE-052: confirm/replace no longer calls `retireAdminObject` on the previous GCash QR.

## Migration from `qrImageKey`

SQL in `20260921030000_be055_056_staff_coach_and_payment_qr`:

- If `public_settings.payment.gcashQrObjectKey` is non-empty, insert active row `qr_migrated_settings_gcash` with label `GCash`.
- If empty (current seed), insert nothing.
- Leave the JSON key in place; handlers treat it as derived.

Not applied to the shared hosted project by this PR.

## RLS

| Object | anon | customer | admin |
| --- | --- | --- | --- |
| `payment_qr_codes` | — | — | all |
| `payment_qr_codes_public` | select | select | select |
| `payments.paymentQrCodeId` | — | own booking (existing payment RLS) | all |

View is `security_barrier` (not `security_invoker`) for the same reason as `coaches_public`: base-table RLS is admin-only and would hide the active QR from anon.

## FE-ADM-040 field check

| FE / domain | Server |
| --- | --- |
| `PaymentQrCode.id/label/imageKey/isActive/createdAt/updatedAt/archivedAt` | Table + admin list |
| `PaymentInstructions.qrImageKey` | Derived from active `imageKey` |
| `PaymentInstructions.gcashName` / `gcashNumber` | Settings JSON (`gcashAccountName` / `gcashNumber`) |
| Collection vs single slot | Table; single-slot routes are compatibility only |

If the FE mock later diverges, **this contract wins**.
