# Coach placeholder avatar (ASSET-014)

Designed, source-free fallback when a coach has **no catalogued source photo** (or no likeness consent). This is **not** a generated face.

Brand: cream / warm-white / beige ground with muted-brown and gold line treatment, echoing the Balansé wreath + seated-figure emblem (`docs/facebook-findings/findings.md` §5). The figure is outline-only: a circle head with **no facial features**. Initials are not baked in — FE may overlay them if a screen needs a per-coach mark.

## Files

| Use | Ratio | Source | Raster |
| --- | --- | --- | --- |
| Public Coaches page cards | 4:5 | `coach-placeholder-4x5.svg` | `.png`, `.webp` (800×1000) |
| Landing coach previews, admin list/form avatar | 1:1 | `coach-placeholder-1x1.svg` | `.png`, `.webp` (800×800) |

Storage keys (`ASSET-030`):

```text
coach-photos/placeholder/headshot-4x5.webp
coach-photos/placeholder/headshot-1x1.webp
```

Until then, mock FE should load the working files above (or copy them into `public/` when `FE-SHR-004` lands). Swapping a placeholder for a late headshot is a **data change only** — same card/avatar frames, different `src`.

## Product surfaces

| Surface | Ticket | Asset |
| --- | --- | --- |
| Public Coaches page cards | `FE-PUB-005` | 4:5 |
| Landing coach previews | `FE-PUB-001` | 1:1 |
| Admin coach form preview / remove-photo fallback | `FE-ADM-007` | 1:1 (preview); 4:5 if the form shows card crop |

A photo-less coach must never render a broken image. Wire `onError` and empty `photo_key` to these files.

## Who uses this today

Coverage (`docs/assets/coverage-matrix.yaml`) routes **Alec James Co**, **Sofia Ocampo**, and **Kate Go** here until ARWs + consent land. Other roster coaches stay on the generate path (`ASSET-012`) and must not receive an invented face if their source is later withdrawn — they drop back to this same pair.

## Review

`preview.html` places the 4:5 placeholder beside a real Coach Ephraim thumb so a mixed grid can be checked. No Higgsfield run; no face generation.
