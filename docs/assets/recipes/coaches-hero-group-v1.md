# Recipe — coaches group hero v1 (ASSET-015 / coaches-b)

**Slot:** `coaches-b` · `group-hero` · `16:9`  
**Working files:** `docs/assets/marketing/coaches/group-hero-16x9.{webp,jpg}` (+ `-thumb`)  
**Approved:** 2026-09-20 · Jose standing auto-approve Assets · Asia/Manila

## Cast (identity-bound — do not invent faces)

| Slug | Intake | Higgsfield media_id |
| --- | --- | --- |
| `ephraim-bacaltos` | `src-coach-ephraim-01` | `1e2d2abe-ba25-4967-9861-a96dbd45f7b9` |
| `rex-francis-regis` | `src-coach-rex-01` | `c8cd8c6f-0292-41e6-ac04-bb938ad74072` |
| `rachelle-tobiano` | `src-coach-rachelle-01` | `3c6439c2-7d55-4f93-bded-480891081819` |
| `jodi-tio` | `src-coach-jodi-01` | `306d918d-947b-4878-a6e9-84a078d27bda` |
| `wolf` | `src-coach-wolf-01` | `1096a1c8-4d42-4200-9ee3-009d79ceabed` |
| `mikaela-danielle` | `src-coach-mikaela-01` | `62be0e00-fa9f-45b8-ae6c-596b33aa9860` |
| `maris-cabrera` | `src-coach-maris-01` | `8839d104-07b9-430d-8f18-ad7c3800bf79` |
| `francis-acido` | `src-coach-francis-01` | `6e301446-b351-4271-bf4e-7bfbbce1d6b8` |

**Excluded until refs land:** Alec James Co, Sofia Ocampo, Kate Go — keep ASSET-014 placeholders elsewhere; never put them in this hero.

## Model / limits

| Intent | Value |
| --- | --- |
| Primary recipe model | `nano_banana_2_shots` (Nano Banana Pro) — **never** pass `nano_banana_pro` |
| Shots constraint | `image_references` must contain **exactly one** image (422 otherwise) |
| Shots behaviour | Emits **3×3 contact sheets**, not a single hero |
| Production master | `nano_banana_2` @ 2k / 16:9 (MCP resolved → `nano_banana_flash`) |
| Upscale | `upscale_image` bytedance → ~4k (`4096×2294`) |

## Pipeline that landed

1. Build 2×4 contact sheet from the eight `docs/coaches/{slug}/` web stills.
2. `media_upload` → PUT → `media_confirm` → media `332ac995-6d17-44ed-add5-3801d0ed8041`.
3. `nano_banana_2_shots` @ 16:9 with that single ref → job `eb0ce475-c298-48fe-9c3b-ad78b8e9cebc` (3×3 grid). Crop top-left 8-coach panel.
4. Re-register panel → media `f5a7c898-ea39-4b95-aa39-d1fa1c7b3436`.
5. Parallel refine: shots again (`7ff0556a-02c9-4d65-a9e1-89a8bc72c8b7`, still a grid) + **`nano_banana_2` @ 2k** (`df7f126e-4031-492a-8930-b3f751999063`) → **single coherent hero** (chosen).
6. `upscale_image` 4k → job `1e7174f8-7587-4a79-a817-d69084b04be6`.
7. Webready: long edge ≤1600, jpg q78 / webp q72; thumbs 480px long edge.

## Prompt (locked art direction)

```text
16:9

Create a candid editorial group image of the referenced Balanse coaching team inside their wellness studio.

Composition: coaches interacting naturally rather than standing in a formal lineup, varied relaxed poses, room for heading copy on one side, visual hints of yoga, boxing, and capoeira training without props feeling staged.

Visual direction: community, expertise, warmth, modern wellness, natural daylight, realistic editorial photography.

Important constraints: preserve each referenced person's identity, no text, no logos, no watermark, no invented team members.

Art direction: Balansé wellness studio interior — warm cream walls, soft natural light plus restrained gold warmth, polished wood or mat floor, subtle brand-neutral props (mats, plants). Eight coaches standing in a loose arc / staggered row facing camera, similar height framing, professional athletic wear (navy/charcoal), friendly confident expressions. Consistent lighting across faces. Exactly eight people — only the referenced coaches. Do not invent faces. Do not include Alec, Sofia, or Kate.

ONE single wide editorial photograph only — never a grid, never a contact sheet, never a collage.
```

## Cost

| Step | Model | Credits (approx) |
| --- | --- | --- |
| Shots v1 + v2 | nano_banana_2_shots | ~4 each |
| Master | nano_banana_2 @ 2k | metered |
| Upscale 4k | upscale_image | metered |

See `docs/assets/cost-log.csv` / `docs/assets/cost-log-append-only.csv` rows dated 2026-09-20 for `coaches-b`.

## FE / BE

- FE: after merge, point the `/coaches` hero at `docs/assets/marketing/coaches/group-hero-16x9.webp` (jpg fallback + `-thumb` blur-up).
- BE Storage: path is on the marketing-assets upload map (`scripts/upload-approved-assets.mjs` → `marketing-assets/coaches/group-hero-16x9.{webp,jpg}`). Run ASSET-030 with service role when available — **do not invent** `SUPABASE_SERVICE_ROLE_KEY`. Thumbs stay git-only.
