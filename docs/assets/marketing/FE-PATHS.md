# FE wiring paths

All files below are committed binaries on this branch under `docs/assets/marketing/`.
Every slot ships `.webp` (primary) + `.jpg` (fallback), and a `-thumb` pair at
480px long edge for blur-up / low-bandwidth placeholders. Thumbs are local-only:
`ASSET-030` uploads the full-size pair, so thumbs have no `storage_key`.

Bucket public base (post `ASSET-030`):
`https://xydundrayuusqizssgby.supabase.co/storage/v1/object/public/marketing-assets/`

Storage key for any full-size file: `marketing-assets/{page}/{slot}-{aspect}.{ext}`.

## Landing
- `landing/hero-accent-16x9` (+ `-thumb`)
- `landing/classes-editorial-3x2` (+ `-thumb`)
- `landing/how-it-works-still-life-1x1` (+ `-thumb`)
- `landing/final-cta-21x9` (+ `-thumb`)
- `landing/mid-cta-21x9` (+ `-thumb`) **NEW — mid-page CTA band, manifest `landing-e`**

## About
- `about/hero-16x9` (+ `-thumb`)
- `about/our-approach-4x3` (+ `-thumb`)
- `about/cta-band-21x9` (+ `-thumb`) **NEW — manifest `about-d`**
- `about/brand-texture-3x1` (unchanged, no thumb)

## Contact
- `contact/visit-hero-16x9` (+ `-thumb`)
- `contact/walk-in-qr-1x1` (unchanged, no thumb)

## FAQs
- `faqs/header-accent-3x2` (+ `-thumb`)

## Coaches
- `coaches/group-hero-16x9` (+ `-thumb`) **NEW — ASSET-015 / manifest `coaches-b` (8-coach cast; Alec/Sofia/Kate excluded)**
- `coaches/specialty-accent-yoga-1x1` (+ `-thumb`)
- `coaches/specialty-accent-boxing-1x1` (+ `-thumb`)
- `coaches/specialty-accent-capoeira-1x1` (+ `-thumb`)
- `coaches/specialty-accent-calisthenics-1x1` (+ `-thumb`) **NEW — manifest `coaches-c-calisthenics`**
- `coaches/specialty-accent-pilates-1x1` (+ `-thumb`) **NEW — manifest `coaches-c-pilates`**
- `coaches/specialty-accent-dance-1x1` (+ `-thumb`) **NEW — manifest `coaches-c-dance`**

## Example wiring

```html
<picture>
  <source
    srcset="/marketing/coaches/group-hero-16x9.webp"
    type="image/webp" />
  <img src="/marketing/coaches/group-hero-16x9.jpg" alt="…" />
</picture>
```

Alt text for every slot lives in `docs/assets/manifest.json` (`alt_text` per row);
use it verbatim rather than writing new copy.

## Sample public URL (post ASSET-030)
https://xydundrayuusqizssgby.supabase.co/storage/v1/object/public/marketing-assets/coaches/group-hero-16x9.webp
