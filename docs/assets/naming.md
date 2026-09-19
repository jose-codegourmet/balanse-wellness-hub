# Asset naming and Storage keys

**Ticket:** ASSET-002 · Aligns with `INF-004` buckets `marketing-assets` and `coach-photos`.

`INF-004` sketched `marketing-assets/{page}/{slug}.{ext}` and `coach-photos/{coach_id}/{uuid}.{ext}`. This track **locks the slug** so keys stay stable across generate → review → `ASSET-030`:

```text
marketing-assets/{page}/{slot}-{aspect}.{ext}
coach-photos/{coach-slug}/headshot-{aspect}.{ext}
```

Examples:

```text
marketing-assets/landing/hero-accent-16x9.webp
marketing-assets/about/brand-texture-3x1.webp
coach-photos/rachelle-tobiano/headshot-4x5.webp
coach-photos/rachelle-tobiano/headshot-1x1.webp
coach-photos/placeholder/headshot-4x5.webp
coach-photos/placeholder/headshot-1x1.webp

Working delivery files (until ASSET-030): `docs/assets/headshots/{slug}/headshot-card-4x5.webp` (card) and `headshot-1x1.webp` (avatar). The approved master remains `headshot-4x5.jpg`.

Marketing working files (until ASSET-030): `docs/assets/marketing/{page}/{slot}-{aspect}.webp` (+ `.jpg` fallback). Examples: `docs/assets/marketing/landing/hero-accent-16x9.webp`, `docs/assets/marketing/coaches/specialty-accent-yoga-1x1.webp`.
```

## Tokens

| Token | Rules |
| --- | --- |
| `page` | `landing` · `about` · `contact` · `faqs` · `coaches` |
| `slot` | kebab-case from the spec title (see inventory `storage_slot`) |
| `aspect` | ratio with `x` not `:`, e.g. `16x9`, `4x5`, `3x1`, `1x1` |
| `ext` | `webp` for delivery; lossless master archived off-bucket |
| `coach-slug` | kebab-case from roster legal/preferred name (`coverage-matrix.yaml`) |

`coach-slug` is the human-stable key. When `BE-004` assigns a UUID `coach_id`, `ASSET-030` may store the same object and write that key (or a copy) onto the coach row. Do **not** invent a second public filename scheme.

## Aspect encoding

| Spec | Filename token |
| --- | --- |
| 16:9 | `16x9` |
| 21:9 | `21x9` |
| 4:5 | `4x5` |
| 4:3 | `4x3` |
| 3:2 | `3x2` |
| 3:1 | `3x1` |
| 1:1 | `1x1` |

## Out of bucket (this phase)

Working files stay in git as docs (`docs/coaches/…` web derivatives only). **ARW originals are never committed.** `storage_key` in the manifest is filled only by `ASSET-030`.
