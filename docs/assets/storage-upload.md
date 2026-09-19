# ASSET-030 — Storage upload

Script: `scripts/upload-approved-assets.mjs`.

## Buckets (do not create new ones)

| Bucket | Role | This script |
| --- | --- | --- |
| `coach-photos` | Public read; coach headshots + placeholder | Upload |
| `marketing-assets` | Public read; page imagery | Upload when approved files exist |
| `payment-proofs` | Private proofs | **Never touch** |

Project: `xydundrayuusqizssgby`  
Public URL template:

```text
https://xydundrayuusqizssgby.supabase.co/storage/v1/object/public/{bucket}/{object_key}
```

`storage_key` in the manifest is `{bucket}/{object_key}` (ASSET-002).

## Local → object mapping

### Coach portraits (`coach-photos/{coach-slug}/…`)

| Working file | Object key |
| --- | --- |
| `docs/assets/headshots/{slug}/headshot-card-4x5.webp` | `{slug}/headshot-4x5.webp` |
| `…/headshot-card-4x5.jpg` | `{slug}/headshot-4x5.jpg` |
| `…/headshot-card-4x5-w400.{webp,jpg}` | `{slug}/headshot-4x5-w400.{ext}` |
| `…/headshot-1x1.{webp,jpg}` | `{slug}/headshot-1x1.{ext}` |
| `…/headshot-1x1-w400` / `w200` | same names under `{slug}/` |

Masters (`headshot-4x5.jpg` contact sheets) and `archive/` PNGs stay in git — they are **not** uploaded.

### Placeholder

| Working file | Object key |
| --- | --- |
| `docs/assets/placeholders/coach-placeholder-4x5.webp` | `placeholder/headshot-4x5.webp` |
| `…-4x5.png` | `placeholder/headshot-4x5.png` |
| `…-1x1.webp` / `.png` | `placeholder/headshot-1x1.{ext}` |

SVG sources are not uploaded (`coach-photos` allows jpeg/png/webp/heic only).

### Marketing (`marketing-assets/{page}/{slot}-{aspect}.{ext}`)

Looks under `docs/assets/marketing/{page}/`. Draft rows with no files are skipped.

## Commands

```bash
node scripts/upload-approved-assets.mjs --dry-run
node scripts/upload-approved-assets.mjs --write-manifest
```

`--upload` upserts with the **service role**. Load it from GitHub Actions secrets, Vercel (server-only), or a local `.env` that is never committed:

```bash
export SUPABASE_URL=https://xydundrayuusqizssgby.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=   # from vault — do not invent
node scripts/upload-approved-assets.mjs --upload
```

Re-runs are safe (`upsert: true`). Only `approved` rows are uploaded. Identity-bound rows without `source_asset_id` are treated as defects and skipped.

## Hosted upload (this wave)

BE ran `--upload` with the service role (do not re-run from this branch unless keys change):

- `coach-photos`: **84** objects
- `marketing-assets`: **0** this run (manifest still has intended keys)
- Sample: https://xydundrayuusqizssgby.supabase.co/storage/v1/object/public/coach-photos/rex-francis-regis/headshot-4x5.webp

## Coach rows (BE follow-up)

Do **not** write `coaches` photo columns from this script. Photo-less coaches resolve to `coach-photos/placeholder/…`.

## Reconciliation

`--upload` lists `coach-photos` and `marketing-assets` and reports:

- planned keys missing from Storage
- Storage objects not in the current approved plan

Both lists should be empty at sign-off (extras from a later approved wave are expected until the next run).
