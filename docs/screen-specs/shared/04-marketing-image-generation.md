# Shared — Marketing Image Generation Guidance

These prompts are intended for generation through Higgsfield CLI using Nano Banana Pro or GPT Image 2.

## Prompt conventions

- Put the target aspect ratio first.
- Generate image assets only; do not render website UI unless the prompt explicitly asks for a device/mockup scene.
- Avoid embedded text, logos, labels, fake UI, watermarks, or unreadable signage unless explicitly requested.
- Keep negative space where the web layout needs copy or controls.
- Prefer believable wellness photography / art direction over generic stock-photo poses.
- The calendar and booking UI are real product UI and should be built in code, not generated into images.
- Marketing assets may be decorative backgrounds, section accents, editorial lifestyle imagery, coach portraits, or subtle textures.
- Reuse a consistent visual language across all public pages.

## Suggested base visual language

Use this as the shared art-direction tail when appropriate:

> modern Cebu wellness studio atmosphere, calm but energetic, editorial fitness photography, natural daylight, warm neutral materials, subtle tropical cues without resort clichés, contemporary minimal interior styling, authentic movement, premium but approachable, realistic skin texture, realistic fabric and equipment, clean composition, generous negative space, no text, no logos, no watermark

## Prompt structure

```text
[ASPECT RATIO]

Create [asset type / scene].

Purpose: [where the asset appears on the page].
Composition: [subject placement, negative space, crop].
Visual direction: [mood, lighting, materials, camera feel].
Important constraints: [no text, no UI, no logo, etc.].
```

## When not to generate an image

Do not add imagery simply to fill space. Skip generation when:

- the interactive calendar already carries the visual hierarchy,
- a section works better with typography and spacing,
- an icon or small CSS accent is sufficient,
- the image would make the booking experience slower or visually noisy.
