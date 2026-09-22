# Storage bucket policies (BE-021)

Buckets from INF-004. Object key prefixes:

- `payment-proofs/{bookingId}/{uuid}.ext` — private
- `coach-photos/{coachId}/{uuid}.ext` — public read
- `marketing-assets/{page}/{slug}.ext` — public read

MIME/size limits stay on `storage.buckets` (server-enforced). Upsert of payment proofs needs INSERT + SELECT + UPDATE (granted to the owning customer).

| Principal | payment-proofs | coach-photos / marketing-assets |
| --- | --- | --- |
| anon | deny | read |
| customer | own booking prefix only | read |
| Super Admin (`is_admin()`) | all + signed URLs later (BE-037) | write/delete |
| Front Desk (`payments.read` / `payments.review`) | payment-proofs read; review writes | — |
| `coaches.manage` / `settings.content.manage` | — | matching bucket writes |

Admin review signed URLs are **not** minted in this schema PR; the SQL policy allows admin SELECT so a later service-role signer can work.

Replacing a coach photo: one `photoKey` column. Application (BE-038 / BE-052) deletes the previous **admin-upload** object and updates the column in one handler. Curated `coach-photos/<slug>` Assets-track keys are never deleted by replace/remove. Schema cannot multi-statement storage+row atomically across APIs.

Admin-uploaded keys are `coach-photos/<coachId>/<uuid>.ext`. Public reads need no signed URL. Writes are admin-only. GCash receive QRs live in `marketing-assets/settings/gcash-qr/` (same public-read / admin-write). Archived QR objects are kept for payment snapshots (BE-056). Payment proofs stay private. See [uploads.md](./uploads.md) and [payment-qr-collection.md](./payment-qr-collection.md).

## Human-only

Dashboard: confirm no extra wide-open `storage.objects` policies were added by hand. Probe anonymous GET on a `payment-proofs` object (must fail) after a sample upload exists.
