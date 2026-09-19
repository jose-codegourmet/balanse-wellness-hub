# Public — Coaches

```text
HEADER
MEET THE COACHES
[All] [Yoga] [Boxing] [Capoeira]

Coach card
Photo | Name | Specialty | Short bio | [View Classes]
```

`View Classes` should focus/filter the public schedule. No coach self-service is implied.


---

# Image / Visual Asset Prompts

Coach portraits should feel like a coherent set. If real coach photos are available, prefer editing or consistent re-shoot direction rather than inventing people.

## Asset A — Coach portrait template

Generate one per real coach only when a valid reference image is available.

```text
4:5

Create a polished but natural editorial portrait of the referenced Balanse coach inside a modern wellness studio.

Composition: waist-up or three-quarter portrait, subject slightly off-center, relaxed confident posture, enough environmental context to suggest their discipline, clean negative space around the subject.

Visual direction: authentic coach portrait, natural daylight, modern Cebu wellness studio, realistic skin and fabric texture, approachable, athletic without aggressive bodybuilding aesthetics, editorial photography.

Important constraints: preserve the referenced person's identity accurately, no text, no logos, no watermark, no fake medals or credentials, no invented tattoos or accessories.
```

## Asset B — Coaches page group hero

Use only if actual coach reference images are available for identity consistency.

```text
16:9

Create a candid editorial group image of the referenced Balanse coaching team inside their wellness studio.

Composition: coaches interacting naturally rather than standing in a formal lineup, varied relaxed poses, room for heading copy on one side, visual hints of yoga, boxing, and capoeira training without props feeling staged.

Visual direction: community, expertise, warmth, modern wellness, natural daylight, realistic editorial photography.

Important constraints: preserve each referenced person's identity, no text, no logos, no watermark, no invented team members.
```

## Asset C — Coach specialty card background accents

```text
1:1

Create a minimal editorial movement-detail image representing [YOGA / BOXING / CAPOEIRA] without showing a full face: hands, footwork, equipment, or body movement detail in a modern studio.

Composition: close crop with strong shape and negative space, suitable as a card accent or subtle background.

Visual direction: natural light, realistic motion, refined editorial fitness photography, modern wellness aesthetic.

Important constraints: no text, no logos, no watermark, avoid cliché stock poses.
```

## Coach image source

Coach cards should pull the current coach profile photo from the database-managed coach record.

Do not hardcode coach images into the marketing page.

Fallback behavior:

- if a coach has no profile photo, show a designed placeholder/avatar,
- do not display a broken image.
