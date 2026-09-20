# Settings write contract (BE-053)

`PATCH /api/admin/settings` is a **partial** patch. Absent keys are unchanged. JSON `null` clears a nullable field (`payment.gcashQrObjectKey`). Last-write-wins **per key** is acceptable because the four sections are independently saveable.

## Sections

| Section | Writable keys | Notes |
| --- | --- | --- |
| `business` | `business.name`, `business.phone`, `business.address` | `openingHours` is **read-only** (422 if sent). |
| `payment` | `payment.gcashAccountName`, `payment.gcashNumber`, `payment.gcashQrObjectKey` | QR upload is BE-052. |
| `content` | `content.about`, `content.email` | `contact.email` lives here; phone/address live on business. Nested patches are partial and safe across the two forms. |
| `policies` | promote only | `POST /api/admin/settings/policies/{id}/promote` |

Send `section` to scope a request. Hold duration and booking cutoff must not appear — `assertNoDeveloperConfig` rejects those keys (not readable on GET either).

Every write audits `settings.update` with `changedKeys`.

## FAQs

First-class table `faqs` (`id`, `question`, `answer`, `sortOrder`). Not reconstructed from a textarea.

| Action | Route |
| --- | --- |
| Create | `POST /api/admin/settings/faqs` |
| Update | `PATCH /api/admin/settings/faqs/{id}` |
| Hard delete | `DELETE /api/admin/settings/faqs/{id}` (audited) |
| Reorder | `POST /api/admin/settings/faqs/reorder` `{ ids: string[] }` — one request, array order is display order |

Constraints (also in BE-051): max 20, question ≤ 160, answer ≤ 2000 markdown. `AdminSettings.faqs[].sortOrder` is additive for the mock.

## Policy promotion

Any `policy_documents` row can be promoted (id, slug, or title). Exactly one `isCurrent` per document: partial unique index `policy_document_versions_one_current`. New `version` must be `YYYY-MM`. Promotion **inserts** a version and flips `isCurrent`; it does **not** rewrite `booking_policy_acceptances` (those FK to the version row — structurally immutable). Undo is not supported; promote a newer `YYYY-MM`. Audit: `policy.promote` with actor, document, old version, new version.

No coach-rate or financial-permission toggles.
