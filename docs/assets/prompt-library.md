# Prompt library (verbatim)

**Ticket:** ASSET-001  
Prompts are copied **exactly** from the public screen specs. Do not edit wording at generation time. Keys: `{page}-{letter}` (see `source_prompt_key` in the manifest).

Shared conventions (not a page prompt): `docs/screen-specs/shared/04-marketing-image-generation.md`.

---

## landing-A — Hero background accent

Source: `docs/screen-specs/public/01-landing-page.md`

```text
16:9

Create a subtle editorial background image for the hero of a modern wellness and movement studio website.

Purpose: sit behind or beside an interactive booking calendar without overpowering the UI.

Composition: very soft architectural wellness-studio environment, lots of clean negative space, subjects pushed toward the far edges, center area calm and visually quiet for calendar UI overlay, no prominent faces in the center.

Visual direction: modern Cebu wellness studio atmosphere, natural daylight, warm neutral materials, soft concrete, light wood, linen textures, understated greenery, premium but approachable, calm energy, realistic photography, restrained depth of field.

Important constraints: no text, no logos, no fake website UI, no calendar graphics, no watermark, no heavy gradients, no gym-bro aesthetic.
```

---

## landing-B — Classes section editorial strip

Source: `docs/screen-specs/public/01-landing-page.md`

```text
3:2

Create an editorial wellness and movement scene showing a diverse small-group class environment that can represent Balanse's mix of yoga, boxing, capoeira, and movement training without looking like a collage.

Composition: one coherent studio scene with layered activity in the background and foreground, natural spacing between people, candid movement rather than posed advertising, enough negative space for a section title and supporting copy.

Visual direction: contemporary wellness studio, authentic movement, natural daylight, warm neutral interior, subtle tropical Southeast Asian context, realistic skin texture and clothing, energetic but calm, premium editorial photography.

Important constraints: no text, no logos, no fake signage, no watermark, no obvious AI distortions, no duplicated people.
```

---

## landing-C — How It Works section accent

Source: `docs/screen-specs/public/01-landing-page.md`

```text
1:1

Create a minimal still-life composition representing easy class booking and wellness preparation: folded towel, reusable water bottle, boxing hand wraps, yoga strap, and a simple phone resting face-down so no screen UI is visible.

Composition: objects arranged with generous breathing room, suitable for cropping into a small section accent.

Visual direction: warm daylight, premium editorial product photography, tactile natural materials, clean wellness aesthetic, restrained color palette, realistic shadows.

Important constraints: no readable text, no logos, no phone screen UI, no watermark.
```

---

## landing-D — Final CTA background

Source: `docs/screen-specs/public/01-landing-page.md`

```text
21:9

Create a wide cinematic wellness studio image for a final website call-to-action section.

Composition: open studio floor at golden-hour daylight, one or two people in relaxed post-session movement near the far right, broad clean negative space on the left for CTA copy and button.

Visual direction: calm accomplishment after training, warm natural light, modern minimal studio, realistic editorial photography, inviting rather than intense.

Important constraints: no text, no logos, no fake signage, no watermark, do not center subjects.
```

---

## about-A — About hero

Source: `docs/screen-specs/public/02-about.md`

```text
16:9

Create an editorial hero image for the About page of Balanse, a modern wellness and movement studio.

Composition: small group of coaches and members in a candid in-between moment after a class, relaxed conversation and movement, subjects grouped toward one side with generous negative space for heading copy.

Visual direction: authentic community, modern Cebu wellness studio, warm daylight, subtle tropical cues, contemporary interior, approachable premium photography, natural expressions, not posed like a corporate team photo.

Important constraints: no text, no logos, no fake signage, no watermark, no exaggerated fitness physiques.
```

---

## about-B — Our Approach section background/accent

Source: `docs/screen-specs/public/02-about.md`

```text
4:3

Create a quiet editorial image that communicates balance between strength, mobility, and recovery.

Composition: studio corner with boxing gloves, yoga mat, capoeira-inspired movement equipment or training elements, soft morning light, human presence optional and secondary, generous negative space.

Visual direction: thoughtful wellness editorial photography, tactile materials, warm neutral tones, realistic, minimal, balanced composition.

Important constraints: no text, no logos, no watermark, avoid product-ad styling.
```

---

## about-C — Brand texture / section divider

Source: `docs/screen-specs/public/02-about.md`

```text
3:1

Create an abstract but photographic texture strip inspired by movement and balance: soft fabric folds, warm concrete, subtle shadows from plants or studio equipment, gentle directional light.

Purpose: optional section divider or background accent.

Important constraints: no text, no logos, no people required, no heavy gradients, no watermark.
```

Generate native `21:9` then crop to `3:1` (see runbook). Prompt text stays `3:1` as specified.

---

## contact-A — Contact / visit hero

Source: `docs/screen-specs/public/03-contact.md`

```text
16:9

Create an editorial image suggesting arrival at a modern wellness studio without depicting a specific real-world building.

Composition: welcoming studio entrance/interior threshold, soft daylight, open doorway, reception-like area, subtle training details in the distance, negative space for contact copy.

Visual direction: contemporary Cebu wellness studio, clean natural materials, warm and approachable, realistic architectural photography, premium but not luxurious.

Important constraints: no address, no fake signage, no logos, no text, no watermark, do not fabricate a specific storefront.
```

If Coach Rex supplies real location photography, it **replaces** this slot (do not keep a fabricated building alongside it).

---

## contact-B — Walk-in QR section accent

Source: `docs/screen-specs/public/03-contact.md`

```text
1:1

Create a minimal editorial still-life for a walk-in booking section: smartphone held naturally near a simple tabletop QR stand, but keep the QR itself abstract/non-scannable and the phone screen blank or out of focus.

Composition: close crop, ample negative space, clean wellness-studio reception context.

Visual direction: realistic photography, warm daylight, minimal materials, approachable modern feel.

Important constraints: no readable QR code, no fake app UI, no text, no logos, no watermark.
```

---

## faqs-A — FAQ header accent

Source: `docs/screen-specs/public/04-faqs.md`

```text
3:2

Create a calm editorial wellness image for the top of an FAQ page: a relaxed studio corner after class with neatly placed yoga mat, boxing wraps, towel, and water bottle.

Composition: objects offset to one side with large negative space for the FAQ heading and search field.

Visual direction: warm natural light, realistic materials, clean wellness aesthetic, minimal and uncluttered.

Important constraints: no text, no logos, no phone screens, no watermark.
```

No further FAQ imagery.

---

## coaches-A — Coach portrait template

Source: `docs/screen-specs/public/05-coaches.md`  
Used once per roster coach **only** with that coach’s reference media id.

```text
4:5

Create a polished but natural editorial portrait of the referenced Balanse coach inside a modern wellness studio.

Composition: waist-up or three-quarter portrait, subject slightly off-center, relaxed confident posture, enough environmental context to suggest their discipline, clean negative space around the subject.

Visual direction: authentic coach portrait, natural daylight, modern Cebu wellness studio, realistic skin and fabric texture, approachable, athletic without aggressive bodybuilding aesthetics, editorial photography.

Important constraints: preserve the referenced person's identity accurately, no text, no logos, no watermark, no fake medals or credentials, no invented tattoos or accessories.
```

---

## coaches-B — Coaches page group hero

Source: `docs/screen-specs/public/05-coaches.md`  
Identity-bound. Skip if any depicted coach lacks source + consent.

```text
16:9

Create a candid editorial group image of the referenced Balanse coaching team inside their wellness studio.

Composition: coaches interacting naturally rather than standing in a formal lineup, varied relaxed poses, room for heading copy on one side, visual hints of yoga, boxing, and capoeira training without props feeling staged.

Visual direction: community, expertise, warmth, modern wellness, natural daylight, realistic editorial photography.

Important constraints: preserve each referenced person's identity, no text, no logos, no watermark, no invented team members.
```

---

## coaches-C — Coach specialty card background accents

Source: `docs/screen-specs/public/05-coaches.md`  
Non-identity. The bracket token is part of the spec prompt; substitute one real discipline per run without rewriting the rest.

```text
1:1

Create a minimal editorial movement-detail image representing [YOGA / BOXING / CAPOEIRA] without showing a full face: hands, footwork, equipment, or body movement detail in a modern studio.

Composition: close crop with strong shape and negative space, suitable as a card accent or subtle background.

Visual direction: natural light, realistic motion, refined editorial fitness photography, modern wellness aesthetic.

Important constraints: no text, no logos, no watermark, avoid cliché stock poses.
```
