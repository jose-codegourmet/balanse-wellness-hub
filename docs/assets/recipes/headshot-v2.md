# Headshot recipe v2 (frozen) — locked pose + 4K

**Ticket:** ASSET-012 follow-on (locked-pose 4K redraw)  
**Frozen:** 2026-09-20 (Asia/Manila)  
**Approval:** Jose auto-approved Assets.  
**Supersedes pose freedom in** `headshot-v1.md` (v1 remains the identity + palette baseline).

Operators must copy this file. Do not paraphrase the prompt.

---

## Why not `nano_banana_2_shots` alone

| Model id | What we observed (2026-09-20) |
| --- | --- |
| `nano_banana_2_shots` (catalog: Nano Banana Pro) | With `image_references`, returns a **3×3 identity contact sheet** (~3712×4608), not a single editorial portrait — even with explicit “SINGLE IMAGE / no grid” language. |
| `nano_banana_2` | Resolves to **`nano_banana_flash`**. Returns a **single** 4:5 editorial portrait at native **3712×4608 (~4K)**. Honors locked pose + cream studio + navy top. |
| `nano_banana_pro` | Do **not** send — historically remaps to the wrong family. |

**Production model for v2 masters:** `nano_banana_2` (runtime: `nano_banana_flash`) @ `aspect_ratio: 4:5`, `resolution: 4k`, `count: 1`, `use_unlim: false`.

Jose’s brief asked for `nano_banana_2_shots`; we documented the sheet behavior and shipped singles via `nano_banana_2` so the roster shares one pose. Do not silently switch back to `_shots` without re-validating output type.

---

## Exact prompt

Copy as `params.prompt`. Discipline token is the only per-coach substitution.

```text
4:5

SINGLE photograph only — not a grid, collage, contact sheet, or multi-panel image.

Polished editorial portrait of the referenced Balanse coach inside a modern wellness studio.

LOCKED POSE (identical for every coach — only face/body identity changes):
- Camera: eye-level, slight 3/4 turn toward camera (same direction for all: body ~15° left of camera, face looking at lens)
- Crop: 4:5 waist-up, headroom ~8%, subject slightly off-center same side
- Hands: lightly clasped in front — same choice for ALL
- Wardrobe: simple dark navy or charcoal athletic top (no logos)
- Background: cream/warm white studio (recipe palette)
- Lighting: soft natural daylight + restrained gold warmth

Composition: one waist-up portrait matching the LOCKED POSE. Clean negative space. No other people.

Visual direction: authentic coach portrait, natural daylight, modern Cebu wellness studio, realistic skin and fabric texture, approachable, athletic without aggressive bodybuilding aesthetics, editorial photography.

Important constraints: preserve the referenced person's identity accurately, no text, no logos, no watermark, no fake medals or credentials, no invented tattoos or accessories, no grid, no collage, no contact sheet.

Art direction (palette and light only — never as overlaid logo or type): cream / warm white / beige-tan backdrop, muted brown and dark navy-charcoal accents, restrained gold warmth in the light. modern Cebu wellness studio atmosphere, calm but energetic, editorial fitness photography, natural daylight, warm neutral materials, subtle tropical cues without resort clichés, contemporary minimal interior styling, authentic movement, premium but approachable, realistic skin texture, realistic fabric and equipment, clean composition, generous negative space, no text, no logos, no watermark.

Discipline hint for this coach (environmental context only, not costume): {DISCIPLINE}.
```

| Coach | `{DISCIPLINE}` |
| --- | --- |
| Ephraim Bacaltos | Circuit Training / Groundworks / Calisthenics |
| Rex Francis Regis | Calisthenics / Mat Pilates / Caliyoga |
| Rachelle Tobiano | Kickboxing / Brazilian Jiu-Jitsu |
| Jodi Tio | Mat Pilates |
| Wolf | Yoga |
| Mikaela Danielle | Dance Fitness |
| Maris Cabrera | Dance Fitness |
| Francis Acido | Dance Fitness |
| Alec / Sofia / Kate | *Do not generate (placeholders).* |

---

## Operator call shape

```text
generate_image
  model: nano_banana_2          # resolves to nano_banana_flash; native ~4K
  prompt: <exact block above>
  aspect_ratio: 4:5
  resolution: 4k
  count: 1
  use_unlim: false
  medias:
    - value: <coach higgsfield_media_id>
      role: image_references
```

Preflight with `get_cost: true`. If output is already ≥4K on the long edge, **skip** `upscale_image`. Otherwise:

```text
upscale_image
  provider: bytedance
  image_id: <job_id or media_id>
  width: <source width>
  height: <source height>
  resolution: 4k
```

---

## Post-processing

1. Accept 4:5 master if identity + locked pose pass review.
2. Write `docs/assets/headshots/{slug}/headshot-4x5.jpg` (and `.webp` sibling, q~80–85).
3. If the PR carries `.b64` sidecars, run `scripts/decode-headshot-v2-b64.sh` before review.
4. Do **not** invent a Supabase service role — BE upserts `coach-photos` with the vaulted key (see PR note).

---

## Consistency proof (v2 wave)

| Coach | Source intake | 4K master | Status |
| --- | --- | --- | --- |
| ephraim-bacaltos | src-coach-ephraim-01 | headshot-4x5.jpg | v2 locked pose |
| rex-francis-regis | src-coach-rex-01 | headshot-4x5.jpg | v2 locked pose |
| rachelle-tobiano | src-coach-rachelle-01 | headshot-4x5.jpg | v2 locked pose |
| jodi-tio | src-coach-jodi-01 | headshot-4x5.jpg | v2 locked pose |
| wolf | src-coach-wolf-01 | headshot-4x5.jpg | v2 locked pose |
| mikaela-danielle | src-coach-mikaela-01 | headshot-4x5.jpg | v2 locked pose |
| maris-cabrera | src-coach-maris-01 | headshot-4x5.jpg | v2 locked pose |
| francis-acido | src-coach-francis-01 | headshot-4x5.jpg | v2 locked pose |
