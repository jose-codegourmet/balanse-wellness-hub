# Coach headshots (ASSET-012 + ASSET-013)

Professional 4:5 **masters** generated with Higgsfield `nano_banana_2_shots` from Drive source photos (ASSET-012). Masters are 3×3 contact sheets. **Do not re-generate faces** for delivery — ASSET-013 crops a reviewed hero tile with ImageMagick (`scripts/derive-headshot-delivery-set.sh`).

| Slug | Master | Hero tile (col,row) | Delivery |
| --- | --- | --- | --- |
| ephraim-bacaltos | generated | 2,2 | card 4:5 + 1:1 + responsive |
| rex-francis-regis | generated | 1,0 | card 4:5 + 1:1 + responsive |
| rachelle-tobiano | generated | 1,0 | card 4:5 + 1:1 + responsive |
| jodi-tio | generated | 1,0 | card 4:5 + 1:1 + responsive |
| wolf | generated | 1,0 | card 4:5 + 1:1 + responsive |
| mikaela-danielle | generated | 1,0 | card 4:5 + 1:1 + responsive |
| maris-cabrera | generated | 1,0 | card 4:5 + 1:1 + responsive |
| francis-acido | generated | 2,0 | card 4:5 + 1:1 + responsive |
| alec-james-co | placeholder (ASSET-014) | — | — |
| sofia-ocampo | placeholder (ASSET-014) | — | — |
| kate-go | placeholder (ASSET-014) | — | — |

Per-coach files:

| File | Role |
| --- | --- |
| `headshot-4x5.jpg` | Approved master (contact sheet). Do not overwrite. |
| `archive/headshot-4x5.png` | Lossless pixel archive of that master. |
| `headshot-4x5.webp` | Sheet preview (page-weight). |
| `headshot-4x5-w800.webp` / `-w400` | Responsive sheet (review only). |
| `headshot-card-4x5.{webp,jpg}` | **Storage card** (`coach-photos/{slug}/headshot-4x5.webp`). |
| `headshot-card-4x5-w400.{webp,jpg}` | Card srcset. |
| `headshot-1x1.{webp,jpg}` | **Storage avatar** (`coach-photos/{slug}/headshot-1x1.webp`). |
| `headshot-1x1-w400` / `-w200` | Avatar srcset. |

Recipe: `docs/assets/recipes/headshot-v1.md`. Delivery set is uploaded by `ASSET-030` (`scripts/upload-approved-assets.mjs`).
