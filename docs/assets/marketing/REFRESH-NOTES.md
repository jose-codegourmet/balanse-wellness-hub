# CTA / marketing refresh (2026-09-19 Asia/Manila)

## Why
ASSET-020–023 used desert/hooded-wanderer mood plate `0dad9831-2091-4538-b892-f9f96e6d7352`, so marketing/CTAs still felt like placeholders.

## Studio mood plate
- Job/media: `d8a483d7-a892-4161-b14f-58d96b5f14da` (gpt_image_1.5 empty Cebu-style studio)
- Retire desert plate for marketing gens going forward

## Model lock
`nano_banana_2_shots` @ `1k` (not `nano_banana_2` / not `nano_banana_pro`)

## Delivered slots (webready jpg+webp under `docs/assets/marketing/`)
### Landing
- `landing/hero-accent-16x9`
- `landing/classes-editorial-3x2`
- `landing/how-it-works-still-life-1x1`
- `landing/final-cta-21x9`
- `landing/mid-cta-21x9` **NEW**

### About
- `about/hero-16x9`
- `about/our-approach-4x3`
- `about/cta-band-21x9` **NEW**
- unchanged: `about/brand-texture-3x1`

### Contact
- `contact/visit-hero-16x9`
- unchanged: `contact/walk-in-qr-1x1`

### FAQs
- `faqs/header-accent-3x2`

### Coaches specialty accents
- yoga / boxing / capoeira (refreshed)
- calisthenics / pilates / dance **NEW**
- ASSET-015 group hero still **skipped** (Alec/Sofia/Kate)

## Binary pack
```bash
bash docs/assets/marketing/_pack/decode.sh
```
Or run workflow `expand-marketing-pack.yml`.

Workspace for parent squash: `/tmp/cta-webready-clean.tar.gz`, `/workspace/balanse-mkt-refresh/webready/`

## Storage
`marketing-assets` anon upload blocked by RLS — skip without service-role. Parent ASSET-030 uploads.
Intended keys: `marketing-assets/{page}/{slot}-{aspect}.{ext}`

## Higgsfield pack media (optional)
media_id: `f8648d4d-c3fe-40c2-b744-18307f986891` (webready tar.gz)
