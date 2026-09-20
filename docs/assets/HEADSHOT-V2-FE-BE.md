# Headshot v2 — FE / BE handoff

## FE

- Paths unchanged: `docs/assets/headshots/{slug}/headshot-4x5.jpg` (+ `.webp`).
- If only `.b64` / `.b64.part*` sidecars are present on the branch, run `scripts/decode-headshot-v2-b64.sh` before bundling.
- No `FE-PATHS` rename required unless you prefer `headshot-4x5-4k.jpg` aliases (not used in this wave).

## BE / Storage

- Re-upload / upsert public bucket **`coach-photos`** for all eight generate-queue slugs (same object keys as ASSET-030).
- Use the **vaulted service role** already held by BE / Actions — **do not invent** a new service role key in chat or in this PR.
- Dry-run: `node scripts/upload-approved-assets.mjs --dry-run` then `--upload` with env from vault.

## Skip

- alec, sofia, kate — placeholders only.
