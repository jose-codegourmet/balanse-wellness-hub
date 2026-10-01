# Storage bucket policies (BE-021)

Buckets from INF-004. Object key prefixes:

- `payment-proofs/{bookingId}/{uuid}.ext` — private
- `coach-photos/{coachId}/{uuid}.ext` — public read
- `marketing-assets/{page}/{slug}.ext` — public read
- `avatars/{profileId}/{cuid}.webp` — private (#344)

MIME/size limits stay on `storage.buckets` (server-enforced). Upsert of payment proofs needs INSERT + SELECT + UPDATE (granted to the owning customer).

| Principal | payment-proofs | coach-photos / marketing-assets |
| --- | --- | --- |
| anon | deny | read |
| customer | own booking prefix only | read |
| Super Admin (`is_admin()`) | all + signed URLs later (BE-037) | write/delete |
| Front Desk (`payments.read` / `payments.review`) | payment-proofs read; review writes | — |
| `coaches.manage` / `settings.content.manage` | — | matching bucket writes |

`avatars` (#344, migration `20261001090100_be344_extend_profile_identity`):

| Principal | avatars |
| --- | --- |
| anon | deny |
| customer | select / insert / update / delete only where `(storage.foldername(name))[1] = 'avatars'` and `[2] = auth.uid()` |
| other customers | deny (no customer-to-customer read) |
| `customers.read` staff / Super Admin | select |

Policies: `avatars_owner_select`, `avatars_owner_insert`, `avatars_owner_update`, `avatars_owner_delete`, `avatars_staff_read`. Public roster avatars are **never** read through these policies: the server mints signed URLs with the service role for `avatar_key` values returned by `app_public.public_session_roster` (#345). `profiles.avatarKey` has a check constraint that pins the key to `avatars/<own id>/…`, so a customer cannot point their profile at someone else's object.

Admin review signed URLs are **not** minted in this schema PR; the SQL policy allows admin SELECT so a later service-role signer can work.

Replacing a coach photo: one `photoKey` column. Application (BE-038 / BE-052) deletes the previous **admin-upload** object and updates the column in one handler. Curated `coach-photos/<slug>` Assets-track keys are never deleted by replace/remove. Schema cannot multi-statement storage+row atomically across APIs.

Admin-uploaded keys are `coach-photos/<coachId>/<uuid>.ext`. Public reads need no signed URL. Writes are admin-only. GCash receive QRs live in `marketing-assets/settings/gcash-qr/` (same public-read / admin-write). Archived QR objects are kept for payment snapshots (BE-056). Payment proofs stay private. See [uploads.md](./uploads.md) and [payment-qr-collection.md](./payment-qr-collection.md).

## Human-only

Dashboard: confirm no extra wide-open `storage.objects` policies were added by hand. Probe anonymous GET on a `payment-proofs` object (must fail) after a sample upload exists.
