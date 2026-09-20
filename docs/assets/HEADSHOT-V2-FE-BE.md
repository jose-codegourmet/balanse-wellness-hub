# Headshot v2 — FE / BE handoff

## FE

- Paths: `docs/assets/headshots/{slug}/headshot-4x5.jpg` (+ `.webp`).
- If binaries are missing on checkout, run `bash scripts/materialize-headshot-v2.sh` (curl + ImageMagick + jq) or wait for the `materialize-headshot-v2` Actions workflow.
- If only `.b64` / `.b64.part*` sidecars exist, run `scripts/decode-headshot-v2-b64.sh`.

## BE / Storage

- Re-upload / upsert public bucket **`coach-photos`** for all eight generate-queue slugs.
- Use the **vaulted service role** already held by BE / Actions — **do not invent** a new service role key in chat or in this PR.
- Dry-run then upload with env from vault (`scripts/upload-approved-assets.mjs` or repo equivalent).

## Skip

- alec, sofia, kate — placeholders only.
