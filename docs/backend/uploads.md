# Coach photo and GCash QR upload (BE-052)

## Two namespaces

| Kind | Key | Owner |
| --- | --- | --- |
| Assets-track curated headshots | `coach-photos/<slug>` | ASSET-030 / `coachPhotoKey(slug)` |
| Admin-uploaded primary photo | `coach-photos/<coachId>/<uuid>.<ext>` | This contract |

Slug keys are **not** stable under rename and must not be overwritten by admin replace/remove. `isAdminUploadPhotoKey()` distinguishes them. `resolveCoachPhotoSources` still resolves curated slugs to bundled crops; admin keys are storage objects (WIRE serves the public URL + transforms). `photoKey = null` is a **client-side** crest fallback (`ASSET-014`) — the server never stores a placeholder key.

## Flow

1. `POST /api/admin/coaches/{id}/photo` with `{ contentType }` → `SignedUploadIntent` (15 minutes, 5 MiB, jpeg/png/webp).
2. FE PUTs bytes to `upload.signedUrl`.
3. `POST` the same path with `{ objectKey }` to confirm. Sets `coaches.photoKey`. Previous **admin** object is deleted immediately. Curated slug keys are left in Storage.
4. `DELETE` sets `photoKey` null and deletes only an admin object.

GCash QR: `POST` / `DELETE /api/admin/settings/qr` — same mint/confirm lifecycle, bucket `marketing-assets`, key `marketing-assets/settings/gcash-qr/<uuid>.<ext>`, types jpeg/png/webp/gif. Public-facing; no signed **read** URL.

BE-056: prefer `POST /api/admin/settings/payment-qrs` (collection). Legacy `POST /settings/qr` confirm creates/activates a collection row and archives the previous active row; it **does not** delete the previous object (payments may snapshot it). Legacy `DELETE /settings/qr` is 422 `cannot_remove_active`. See [payment-qr-collection.md](./payment-qr-collection.md).

Payment proofs stay private (`getAdminPaymentProofSignedUrl`).

## Customer avatar (`profile_avatar`, #344)

Same BE-052 mint / confirm / reap lifecycle. No new upload mechanism and **no handler this phase** (`PATCH /api/me` and avatar endpoints are not authorized yet).

- Bucket `avatars` (private), 5 MiB, `image/jpeg` / `image/png` / `image/webp`. FE crops to a 512×512 circle and uploads WEBP.
- Key: `avatars/<profileId>/<cuid>.webp`. `profiles.avatarKey` must match `^avatars/<id>/[A-Za-z0-9_-]+\.(webp|jpg|jpeg|png)$` (DB check).
- `pending_uploads` row: `bucket = 'avatars'`, `purpose = 'profile_avatar'`, `entityId = profileId`, **`profileId`** = the customer (new nullable actor column; `actorId` stays the staff actor). At most one of `actorId` / `profileId` is set (`pending_uploads_single_actor`).
- Confirm sets `profiles.avatarKey` and deletes the previous avatar object. Remove sets it to `null` (initials fallback) and deletes the object.
- Reads are always signed URLs (≈10 minutes). No public URL, no image transformations on a public path.
- Customer avatar changes are self-edits and do not write `audit_events`.

## Derivatives

**No server image pipeline on confirm.** Public buckets use [Supabase image transformations](https://supabase.com/docs/guides/storage/serving/image-transformations) on read (`width`, `resize`, `format=origin` / webp). Cache: CDN on the public object URL. FE still asks for 1:1, 4:5, 480w + master; those are transform query params, not extra stored objects. Admin-side crop (`image-cropper`) is optional and out of band.

Signed upload uses the **service role on the server only**. Never put a service-role key in `NEXT_PUBLIC_*`.

## Orphans

`pending_uploads` records each minted key. Confirm stamps `confirmedAt`. `public.reap_pending_uploads()` deletes rows older than 24h that were never confirmed (BE-018 job `balanse-reap-pending-uploads`, hourly). Object bytes may still need a later Storage sweep; the row is the source of truth for abandoned intents.

## Audit

`coach.photo.replace`, `coach.photo.remove`, `settings.qr.replace`, `payment_qr.create` / `update` / `activate` / `archive`. Legacy `settings.qr.remove` is no longer a successful path.
