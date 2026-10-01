# Storage buckets

**INF-004.** Created on project `xydundrayuusqizssgby` by migration `20260919090100_inf004_create_storage_buckets`. `avatars` (#344) comes from `20261001090000_be344_create_avatars_bucket`. `db:ensure-buckets` replays both files (idempotent). Re-run:

```bash
pnpm --filter @balanse/db db:deploy
# or, if you must re-assert buckets only:
pnpm --filter @balanse/db db:ensure-buckets
```

| Bucket | Visibility | Size limit | MIME allowlist | Key convention |
| --- | --- | --- | --- | --- |
| `payment-proofs` | **Private** (signed URL later, `BE-037`) | 5 MiB | `image/jpeg`, `image/png`, `image/webp`, `image/heic` | `payment-proofs/{booking_id}/{uuid}.{ext}` |
| `coach-photos` | Public read, admin write (`BE-021`) | 5 MiB | `image/jpeg`, `image/png`, `image/webp`, `image/heic` | `coach-photos/{coach_id}/{uuid}.{ext}` |
| `marketing-assets` | Public read, admin write | 10 MiB | `image/jpeg`, `image/png`, `image/webp`, `image/gif` | `marketing-assets/{page}/{slug}.{ext}` |
| `avatars` (#344) | **Private**. Owner write, `customers.read` staff read, signed URLs only | 5 MiB | `image/jpeg`, `image/png`, `image/webp` | `avatars/{profile_id}/{cuid}.webp` |

Limits and MIME lists are set on `storage.buckets` (`file_size_limit`, `allowed_mime_types`). Fine-grained object RLS is **BE-021**.

## Visibility checks

Public object URL pattern:

`https://xydundrayuusqizssgby.supabase.co/storage/v1/object/public/<bucket>/<key>`

- Unauthenticated GET on a **private** `payment-proofs` object must fail (no public URL / 400).
- Unauthenticated GET on a **public** `coach-photos` object must succeed once an object exists.
- Unauthenticated GET on a **private** `avatars` object must fail. Avatars are only served through short-lived signed URLs (see [rls-policies.md](./rls-policies.md#public-read-functions-345)).

Probe objects (if present):

- `payment-proofs/inf-004-probe/private.txt` — must not be readable anonymously
- `coach-photos/inf-004-probe/public.txt` — public read
