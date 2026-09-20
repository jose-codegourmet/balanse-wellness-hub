# Headshot v2 — FE / BE handoff

## FE

- Paths: `docs/assets/headshots/{slug}/headshot-4x5.jpg` (+ `.webp`).
- If binaries are missing on checkout, run `bash scripts/materialize-headshot-v2.sh` (curl + ImageMagick + jq) or wait for the `materialize-headshot-v2` Actions workflow.
- If only `.b64` / `.b64.part*` sidecars exist, run `scripts/decode-headshot-v2-b64.sh`.

### Bundled FE set (done)

`bash scripts/derive-headshot-v2-fe-bundle.sh` rewrites the bundled headshots both
apps already serve, straight from the v2 masters. Filenames and FE paths are
unchanged, so `resolveCoachPhotoSources()` and the screens need no edits:

| File | Size | Bundled in |
| --- | --- | --- |
| `headshot-card-4x5.{jpg,webp}` | 800×1000 | web + admin |
| `headshot-card-4x5-w400.{jpg,webp}` | 400×500 | web + admin |
| `headshot-card-4x5-w1600.{jpg,webp}` | 1600×2000 | web |
| `headshot-1x1.{jpg,webp}` | 800×800 | web + admin |
| `headshot-1x1-w400.{jpg,webp}` | 400×400 | web + admin |
| `headshot-1x1-w200.{jpg,webp}` | 200×200 | web + admin |
| `headshot-4x5.{jpg,webp}` | 1200×1500 | web + admin |
| `headshot-upscaled-4k.{jpg,webp}` | 3276×4096 | web |

The card is the whole locked-pose frame at an exact 4:5. The 1:1 avatar is a
head-and-shoulders square with the crown detected against the cream backdrop, so
every coach gets the same headroom at 96–128 CSS px. `headshot-upscaled-4k.*` is
the native ~4K master — v2 skips the v1 `ai-upscale-4k` step.

### Still on v1 (not this PR)

- `docs/assets/headshots/{slug}/headshot-card-4x5.*`, `headshot-1x1*` and
  `headshot-upscaled-4k.*` are still the ASSET-013 sheet-tile crops, and
  `archive/headshot-4x5.png` is still the v1 sheet archive.
- `scripts/derive-headshot-delivery-set.sh` extracts a 3×3 hero tile, so it only
  applies to v1 masters. Re-deriving the `docs/` delivery set for v2 (and, with
  it, another `coach-photos` upsert so Storage matches the bundle before
  WIRE-012 serves Storage URLs) stays with Assets / BE.

## BE / Storage

- Re-upload / upsert public bucket **`coach-photos`** for all eight generate-queue slugs.
- Use the **vaulted service role** already held by BE / Actions — **do not invent** a new service role key in chat or in this PR.
- Dry-run then upload with env from vault (`scripts/upload-approved-assets.mjs` or repo equivalent).

## Skip

- alec, sofia, kate — placeholders only.
