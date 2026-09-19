# Higgsfield generation runbook

**Ticket:** ASSET-001 · **Schema / inventory:** ASSET-002 · **Sources:** ASSET-010  
**Spec sources:** `docs/screen-specs/shared/04-marketing-image-generation.md`; `docs/MVP-ROADMAP.md` §7; public screen-spec Image / Visual Asset Prompts.

This runbook is for operators. It does **not** generate images. Copy prompts from [prompt-library.md](prompt-library.md) **verbatim** — do not paraphrase.

---

## Model lock (Jose / TL)

For this track, generate images with Higgsfield **`nano_banana_2_shots` only** (catalog display name **Nano Banana Pro**), at **`1k` resolution**.

**Do not pass `nano_banana_pro` as the runtime model id.** MCP remaps that alias to **`nano_banana_2`**, which is the wrong family. Always send `nano_banana_2_shots`.

Do **not** use `soul_2`, GPT Image, 2k, or 4k for production assets unless Jose / TL revises this lock in writing. Catalogue notes about `soul_2` below exist only so operators understand why we do **not** pick it for 4:5 headshots.

Frozen coach-headshot prompt and handoff: [recipes/headshot-v1.md](recipes/headshot-v1.md).

---

## Four-stage pipeline

Every generated asset follows this chain (`docs/MVP-ROADMAP.md` §7.2):

```text
1. SOURCE      raw/source image ingested and catalogued (Balanse image assets + this repo’s catalog)
                  └─ identity-bound assets REQUIRE this step
                  └─ non-identity assets legitimately have no source
2. GENERATE    Higgsfield run (nano_banana_2_shots @ 1k) that takes catalogued source as reference when required
3. REVIEW      internal review + client approval; status draft → client-review → approved | rejected
4. STORE       approved output uploaded to Supabase Storage (coach-photos / marketing-assets)
                  └─ depends on INF-004 (buckets) and BE-021 (policies) — ASSET-030
```

### Stage 1 — Source

See [intake.md](intake.md) and [coverage-matrix.yaml](coverage-matrix.yaml).

- **Identity-bound** (must have a catalogued source photo **and** recorded consent before generate):
  - Coach headshots (`coaches` / Asset A per coach)
  - Coaches page group hero (`coaches` / Asset B) — only if **every depicted coach** has source + consent
- **Non-identity / source-free** (text-to-image; missing `source_asset_id` is intentional):
  - Landing A–D, About A–C, Contact A–B, FAQs A
  - Coach specialty accents (`coaches` / Asset C) — no full faces
  - Coach placeholder avatar (`ASSET-014`) — **never a generated face**

**Do not invent coach faces.** No source photo → placeholder (`ASSET-014`), not a generated portrait.

Private camera originals (Sony **ARW** and similar) stay **out of the public repo**. Web derivatives already in `docs/coaches/*` are working previews, not ARW sources.

### Stage 2 — Generate

1. Open [prompt-library.md](prompt-library.md) and copy the prompt for `{page}/{letter}` exactly.
2. Append the [shared art-direction tail](#shared-art-direction-tail) when the spec says “when appropriate” (always for this track unless the prompt already restates the same constraints).
3. Call Higgsfield `generate_image` (or `generate_image_batch` + `jobs_wait` for independent slots) with:
   - `model`: `nano_banana_2_shots` (never `nano_banana_pro`)
   - `resolution`: `1k` (if the tool exposes it; otherwise the model default must be confirmed as 1k before spend)
   - `aspect_ratio`: native ratio from the library, or the generate-then-crop native ratio (see [aspect-ratio gaps](#aspect-ratio-gaps))
   - `medias[]`: `{ value: <higgsfield_media_id>, role: image_references }` for identity-bound assets only
4. Preflight with `get_cost: true` and log the result in [cost-log.csv](cost-log.csv).
5. Do **not** pass raw URLs in `medias[].value`. Media id only.

Calendar and booking UI are **coded product UI**. Never generate a calendar, booking form, or fake website chrome.

### Stage 3 — Review

Internal reviewer (Assets lane) then Coach Rex / client.

Statuses in the manifest: `draft` | `client-review` | `approved` | `rejected`.  
**Only `approved` assets may ship** to a public page. Alt text is **required** before `approved`.

See [review gate](#review-gate).

### Stage 4 — Store (`ASSET-030`)

Buckets `coach-photos` and `marketing-assets` exist on project `xydundrayuusqizssgby` (INF-004). Do **not** write `payment-proofs`.

Upload is scripted and idempotent:

```bash
# Plan only (no network writes)
node scripts/upload-approved-assets.mjs --dry-run

# Write intended storage_key + public_url onto approved rows
node scripts/upload-approved-assets.mjs --write-manifest

# Upsert objects (requires SUPABASE_SERVICE_ROLE_KEY; never invent a key)
SUPABASE_URL=https://xydundrayuusqizssgby.supabase.co \
  node scripts/upload-approved-assets.mjs --upload
```

See [storage-upload.md](storage-upload.md). Keys follow [naming.md](naming.md). Only `approved` assets ship. Coach `photo_*` columns are **not** written by this script (BE follow-up). BE already upserted **84** `coach-photos` objects; marketing was **0** this run.

---

## Prompt structure

From `shared/04` — **aspect ratio first**:

```text
[ASPECT RATIO]

Create [asset type / scene].

Purpose: [where the asset appears on the page].
Composition: [subject placement, negative space, crop].
Visual direction: [mood, lighting, materials, camera feel].
Important constraints: [no text, no UI, no logo, etc.].
```

---

## Shared art-direction tail

Use this tail when appropriate (verbatim from `shared/04`):

> modern Cebu wellness studio atmosphere, calm but energetic, editorial fitness photography, natural daylight, warm neutral materials, subtle tropical cues without resort clichés, contemporary minimal interior styling, authentic movement, premium but approachable, realistic skin texture, realistic fabric and equipment, clean composition, generous negative space, no text, no logos, no watermark

Brand palette cues (findings §5; art direction only — **not** overlaid logos or text): cream, warm white, beige/tan, muted brown, dark navy/charcoal, restrained gold warmth.

---

## Model selection per asset type

| Asset class | Model | Resolution | Notes |
| --- | --- | --- | --- |
| All production gens this track | `nano_banana_2_shots` | **1k** | Jose / TL lock. Display name Nano Banana Pro. |
| Coach headshots (4:5) | `nano_banana_2_shots` | 1k | Native `4:5`. Requires `image_references` media id. Recipe: [headshot-v1.md](recipes/headshot-v1.md) |
| Group hero (16:9) | `nano_banana_2_shots` | 1k | Identity-bound; skip if roster coverage incomplete |
| Non-identity scenes / still lifes / textures | `nano_banana_2_shots` | 1k | `source_free: true`. Model requires exactly one `image_references` — use the neutral mood plate `0dad9831-2091-4538-b892-f9f96e6d7352` (not a likeness). Do **not** set `source_asset_id`. |
| Placeholder avatar | *not generated as a face* | — | Designed SVG at `docs/assets/placeholders/` (`ASSET-014`) |

`soul_2` supports portraits and `soul_id` but **does not offer 4:5** and is **out of policy** for this work. Do not use it to work around ratio gaps.

---

## Source → Higgsfield media-id handoff

End-to-end:

1. **Locate** a catalogued source in Balanse image assets (Drive folder **Coaches Photos and Docs** + `docs/coaches/{slug}/` web derivatives). Confirm the row in [source-catalog.yaml](source-catalog.yaml).
2. **Register** as Higgsfield media:
   - Local file: `media_upload` → HTTP PUT bytes to `upload_url` → `media_confirm` (`type: image`), **or** `media_upload_widget` in an Apps UI client.
   - Public URL only: `media_import_url` first; never put the URL in `medias[].value`.
3. **Pass** the returned `media_id` as `medias[].value` with role `image_references` on `generate_image`.
4. **Record** that id on the catalog row (`higgsfield_media_id`) and on the output manifest entry (`source_asset_id.higgsfield_media_id`).

Identity-bound outputs without a `source_asset_id` **fail validation** (see `scripts/validate-asset-manifest.mjs`).

---

## Do-not-generate checklist

Reproduced from `shared/04`. Part of the review gate. Skip generation when:

- the interactive calendar already carries the visual hierarchy,
- a section works better with typography and spacing,
- an icon or small CSS accent is sufficient,
- the image would make the booking experience slower or visually noisy.

Also do not generate:

- any **calendar or booking UI**,
- a **coach face** without a catalogued source photo and consent,
- **Sella** or any name not on the confirmed 11-person roster (`findings.md` §4b),
- extra FAQ imagery beyond Asset A,
- a **literal fabricated storefront / address** for Contact A,
- a **scannable QR** or fake app UI for Contact B,
- invented team members on the group hero.

Inventory rows with `generation_policy: do_not_generate` record these skips.

---

## Review gate

**Who approves**

| Step | Who | Outcome |
| --- | --- | --- |
| Internal | Assets operator | `draft` → `client-review` or `rejected` |
| Client | Standing **Jose auto-approve** of all Assets (2026-09-19). Coach Rex remains the likeness/consistency reviewer for roster waves. | `client-review` → `approved` or `rejected` |

**Reject** an output if any of the following is true:

- embedded text
- logos
- fake UI / signage
- watermarks
- insufficient negative space for the layout
- duplicated people
- visible AI distortion
- calendar / booking chrome in the image
- invented credentials, medals, tattoos, or accessories
- identity-bound work that is not recognisably the source person
- missing alt text (cannot mark `approved`)
- identity-bound work missing `source_asset_id`

---

## Aspect-ratio gaps

| Spec ratio | Native on `nano_banana_2_shots`? | Procedure |
| --- | --- | --- |
| `4:5` (coach portraits) | Yes | Generate `4:5` at 1k. (`soul_2` cannot; we do not use `soul_2`.) |
| `3:1` (About C brand texture) | **No** listed image model offers `3:1` | Generate **`21:9`** at 1k, then **center-weighted crop** to `3:1` (height = width/3). Record crop in `post_processing`. |
| `soul_2` + `4:5` (if policy ever changes) | No | Generate `3:4`, then `reframe`/crop to `4:5`. Prefer staying on `nano_banana_2_shots`. |

### Generate-then-crop (3:1)

1. Generate About C at `21:9`, `nano_banana_2_shots`, `1k`.
2. Crop to 3:1 keeping the calm mid-band (avoid cutting a hard horizon at the frame edge).
3. Optional: `reframe` if Higgsfield crop is cleaner than a local crop.
4. Manifest: `aspect_ratio: "3:1"`, `post_processing: [{ op: "crop", from: "21:9", to: "3:1", notes: "..." }]`.

---

## Post-processing operations (Higgsfield)

Available after generate (do not re-generate derivatives from scratch):

- `reframe` — ratio changes
- `upscale_image` — only if 1k is short after crop; policy still starts at 1k
- `remove_background` — placeholder / cutouts only if design requires
- `outpaint_image` — last resort for negative space; re-review
- `generate_image_batch` + `jobs_wait` — independent slots, not variants of one prompt

Delivery crops for headshots (`ASSET-013`): extract a reviewed hero cell from the ASSET-012 3×3 master with ImageMagick (`scripts/derive-headshot-delivery-set.sh`), then 4:5 card, 1:1 center avatar, WebP q82 + JPEG q85 fallbacks, and `w400`/`w200` sizes. Lossless PNG of the master lives in `archive/`. Never re-generate a face for a derivative.

---

## Cost log

Use [cost-log.csv](cost-log.csv). One row per generation attempt (including rejects). Columns: date, asset_id, prompt_key, model, resolution, aspect_ratio, credits, job_id, outcome, notes.

Free-trial “unlim” generations were not reliably spendable at roadmap writing. Default to paid credits; do not set `use_unlim: true` unless Jose explicitly asks.
