# Headshot recipe v1 (frozen)

**Ticket:** ASSET-011  
**Frozen:** 2026-09-19  
**Pilot:** Coach Ephraim Bacaltos (`coach-headshot-ephraim-bacaltos`)  
**Consistency coach:** Rex Francis Regis — **same recipe**; ASSET-012 roster wave approved  
**Approval:** Jose auto-approved all Assets (2026-09-19). Likeness judged against each coach’s catalogued `intake_item_id`.

Operators must copy this file. Do not paraphrase the prompt. Do not pass `nano_banana_pro` as the Higgsfield `model` id.

---

## Runtime model (do not remap)

| Field | Locked value |
| --- | --- |
| Catalog display name | Nano Banana Pro |
| **`generate_image` `model` id** | **`nano_banana_2_shots`** |
| Why not `nano_banana_pro` | Higgsfield MCP remaps `nano_banana_pro` to **`nano_banana_2`** (wrong family). Always send `nano_banana_2_shots`. |
| Resolution intent | **1k** |
| Aspect ratio | **4:5** (native on this model) |
| `count` | `1` for a production master |
| `use_unlim` | `false` unless Jose explicitly asks |
| Seed / `soul_id` | **None.** `nano_banana_2_shots` has no seed or Soul parameter. Repeatability comes from the same prompt + same reference media + this parameter set. Do **not** switch to `soul_2` to get a `soul_id`. |

Preflight: `generate_image` with the same params and `get_cost: true`. Nano Banana Pro shots are ~**4 credits** at 1k.

---

## Exact prompt

Copy the block below as `params.prompt` (aspect ratio first, then coaches-A verbatim, then the locked Balansé art-direction paragraph). Discipline token is the only per-coach substitution.

```text
4:5

Create a polished but natural editorial portrait of the referenced Balanse coach inside a modern wellness studio.

Composition: waist-up or three-quarter portrait, subject slightly off-center, relaxed confident posture, enough environmental context to suggest their discipline, clean negative space around the subject.

Visual direction: authentic coach portrait, natural daylight, modern Cebu wellness studio, realistic skin and fabric texture, approachable, athletic without aggressive bodybuilding aesthetics, editorial photography.

Important constraints: preserve the referenced person's identity accurately, no text, no logos, no watermark, no fake medals or credentials, no invented tattoos or accessories.

Art direction (palette and light only — never as overlaid logo or type): cream / warm white / beige-tan backdrop, muted brown and dark navy-charcoal accents, restrained gold warmth in the light. modern Cebu wellness studio atmosphere, calm but energetic, editorial fitness photography, natural daylight, warm neutral materials, subtle tropical cues without resort clichés, contemporary minimal interior styling, authentic movement, premium but approachable, realistic skin texture, realistic fabric and equipment, clean composition, generous negative space, no text, no logos, no watermark.

Discipline hint for this coach (environmental context only, not costume): {DISCIPLINE}.
```

| Coach | `{DISCIPLINE}` |
| --- | --- |
| Ephraim Bacaltos (pilot) | Circuit Training / Groundworks / Calisthenics |
| Rex Francis Regis (consistency) | Calisthenics / Mat Pilates / Caliyoga |
| Rachelle Tobiano | Kickboxing / Brazilian Jiu-Jitsu |
| Jodi Tio | Mat Pilates |
| Wolf | Yoga |
| Mikaela Danielle | Dance Fitness |
| Maris Cabrera | Dance Fitness |
| Francis Acido | Dance Fitness |
| Alec James Co / Sofia Ocampo / Kate Go | *Do not generate. ASSET-014 placeholder.* |

Do not add names, class titles as text in the image, invented kit, or a Balansé wordmark.

---

## Source media-id handoff

Identity-bound. Never generate from text alone.

1. Confirm the coach in `docs/assets/coverage-matrix.yaml`: `source_photo_received: yes`, `consent_recorded: yes`, `decision: generate`, quality `pass`.
2. Confirm `intake_item_id` in `docs/assets/source-catalog.yaml`.
3. Register the **catalogued source photograph** (Drive ARW developed to a web still, or the existing `docs/coaches/{slug}/` preview) as Higgsfield media:
   - Apps UI: `media_upload_widget`
   - Local bytes: `media_upload` → PUT → `media_confirm` (`type: image`)
   - Public URL: `media_import_url` first
4. Pass **only** the returned UUID:

```text
medias: [{ value: "<higgsfield_media_id>", role: "image_references" }]
```

5. Never put an `https://` URL in `medias[].value`.
6. Write the UUID onto `source-catalog.yaml` (`higgsfield_media_id`) and the manifest `source_asset_id.higgsfield_media_id`.

**Pilot registration**

| Field | Value |
| --- | --- |
| `intake_item_id` | `src-coach-ephraim-01` |
| Higgsfield `media_id` | `1e2d2abe-ba25-4967-9861-a96dbd45f7b9` |
| Job id | `af39341b-0d60-4959-9c60-0ef77aab707f` |
| Working master | `docs/assets/headshots/ephraim-bacaltos/headshot-4x5.jpg` |

Rex and the remaining generate-queue coaches were registered for ASSET-012. Placeholder coaches (Alec, Sofia, Kate) are never registered.

---

## Operator call shape

```text
generate_image
  model: nano_banana_2_shots
  prompt: <exact block above>
  aspect_ratio: 4:5
  count: 1
  use_unlim: false
  medias:
    - value: <that coach's higgsfield_media_id>
      role: image_references
```

Resolution is the 1k product intent. This model’s MCP parameter list does not expose a separate `resolution` field; do not add undocumented params. Do not request 2k/4k.

---

## Background, light, crop, colour (tight enough to reproduce)

| Axis | Lock |
| --- | --- |
| Crop | 4:5, waist-up or three-quarter. Subject slightly off-centre. Headroom small; do not clip the crown or cut through the hands if they are in frame. |
| Background | Cream / warm white / beige-tan studio. Soft, unbranded. Enough room for a card title. No readable signage. |
| Lighting | Natural daylight plus restrained gold warmth. No hard beauty-dish shine, no neon, no gym-bro contrast. |
| Colour | Warm neutrals; muted brown / navy-charcoal only as clothing or set accents. No graphic overlays. |
| Skin / fabric | Believable texture. No beauty-filter plastic skin. |
| Forbidden | Text, logo, watermark, fake medals/credentials, invented tattoos or accessories, extra people, AI hands/faces that are not the source person. |

A different operator using this prompt, `nano_banana_2_shots`, 4:5, and the coach’s own `image_references` media id should land in the same series.

---

## Poor-source guidance

Do **not** “fix” a weak photo with extra generate passes, upscale, or outpaint.

Request a better upload through Balanse image assets / Drive (`docs/assets/intake.md`) when any of these is true:

- face not clearly visible (silhouette, back of head, heavy crop);
- face is soft or pixelated after develop (web long-edge under ~800px is a warning);
- heavy beauty filter, meme overlay, or text already in the frame;
- wrong person, or a group where the coach cannot be isolated;
- someone who knows them flags the frame as not current / not them.

Quality `fail` or `pending` stays off the generate queue. No source or no consent → `ASSET-014` placeholder, never an invented face.

---

## Post-processing (this recipe)

ASSET-011 master:

1. Accept the 4:5 1k output if it passes the review gate.
2. Commit JPEG working master at `docs/assets/headshots/{slug}/headshot-4x5.jpg`.
3. Optional WebP sibling at the same stem (quality ~80–85) for page-weight previews.
4. Do **not** `upscale_image`, `reframe`, `remove_background`, or `outpaint_image` on the lockup master.
5. Do **not** re-generate derivatives from scratch later — `ASSET-013` crops from this approved master only.

Manifest `post_processing` for the Ephraim pilot is `[]` (native 4:5, no crop).

---

## Review gate (lockup)

Reject if the review list in `docs/assets/runbook.md` fails, or if the output is not recognisably the person in the source photo.

Statuses: only `approved` may ship. Alt text is required before `approved`. Identity-bound rows require `source_asset_id.intake_item_id`.

---

## Consistency proof

| Coach | Source | Working master | Status |
| --- | --- | --- | --- |
| Ephraim Bacaltos | `src-coach-ephraim-01` | `docs/assets/headshots/ephraim-bacaltos/headshot-4x5.jpg` | Approved (ASSET-011; not re-run in ASSET-012) |
| Rex Francis Regis | `src-coach-rex-01` | `docs/assets/headshots/rex-francis-regis/headshot-4x5.jpg` | Approved ASSET-012 |
| Rachelle Tobiano | `src-coach-rachelle-01` | `docs/assets/headshots/rachelle-tobiano/headshot-4x5.jpg` | Approved ASSET-012 |
| Jodi Tio | `src-coach-jodi-01` | `docs/assets/headshots/jodi-tio/headshot-4x5.jpg` | Approved ASSET-012 |
| Wolf | `src-coach-wolf-01` | `docs/assets/headshots/wolf/headshot-4x5.jpg` | Approved ASSET-012 |
| Mikaela Danielle | `src-coach-mikaela-01` | `docs/assets/headshots/mikaela-danielle/headshot-4x5.jpg` | Approved ASSET-012 |
| Maris Cabrera | `src-coach-maris-01` | `docs/assets/headshots/maris-cabrera/headshot-4x5.jpg` | Approved ASSET-012 |
| Francis Acido | `src-coach-francis-01` | `docs/assets/headshots/francis-acido/headshot-4x5.jpg` | Approved ASSET-012 |
| Alec / Sofia / Kate | — | `docs/assets/placeholders/coach-placeholder-4x5.svg` | ASSET-014 only — no invented face |

---

## Late-arrival procedure (ASSET-012)

Do **not** re-run the whole roster when a new source lands.

1. Catalogue the photo (`intake.md` + `coverage-matrix.yaml` + `source-catalog.yaml`).
2. Confirm `source_photo_received: yes`, `consent_recorded: yes`, `decision: generate`, quality `pass`.
3. Register **that coach’s** source as Higgsfield media; run `headshot-v1` once with `nano_banana_2_shots` @ 4:5 / 1k.
4. Side-by-side check against the existing approved set (Ephraim + Rex first). Approve or reject **that slug only**.
5. Write `working_path`, `source_asset_id`, model, date, approver, and one cost-log row. Leave other masters untouched.

**Exercised:** ASSET-011 locked Ephraim only. ASSET-012 generated the other seven source-backed coaches without regenerating Ephraim (~4 credits × 7). Alec / Sofia / Kate stay on this same procedure when ARWs arrive.
