# RichTextarea — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Admin long-form control: a `Textarea` plus a Markdown-subset toolbar (bold, italic, links, lists, paragraph breaks) and an optional token-styled preview. The value is always a plain string.

## When to use

- Public-facing prose edited in admin (`about`, coach short bio, class short description, FAQ answers)
- Anywhere the stored value must stay a string and the rendered marks are only this subset

## When NOT to use

- Short single-line fields → use **Input**
- Plain internal notes with no formatting → use **Textarea**
- Anything customer-facing authored in `apps/web` → not this control (customers do not compose rich text here)

## Examples

```tsx
import { Field, FieldLabel, RichTextarea } from "@balanse/ui";

<Field>
  <FieldLabel htmlFor="about">About</FieldLabel>
  <RichTextarea id="about" name="about" preview maxLength={2000} minRows={4} maxRows={12} />
</Field>
```

Preview the same subset on public surfaces by importing the parser (not the control):

```tsx
import { renderMarkdownSubset } from "@balanse/ui";

<div className="[&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_a]:underline">
  {renderMarkdownSubset(about)}
</div>
```

## Gotchas

- `"use client"` — the control uses refs, selection, and local preview state.
- Link `href`s are allowlisted to `http:`, `https:`, and `mailto:`. `javascript:` and `data:` are rejected because React does not reliably block them. External `http(s)` links get `rel="noopener noreferrer"`.
- Auto-grow is ref-based (`minRows` / `maxRows`) so Firefox and Safari grow too. Do not rely on `field-sizing-content` (Chromium-only).
- The counter deliberately does **not** set the native `maxLength` attribute, so an over-limit state can exist and is announced through `FieldError`.
- Stored format (Markdown vs sanitised HTML vs plain text) for `public_content.about`, `coaches.short_bio`, `classes.short_description`, and FAQ answers is **unresolved** and tracked on BE-053 (#227). Until BE answers, FE treats the value as Markdown.
- Preview is styled with brand tokens, not Tailwind `prose` (`@tailwindcss/typography` is not registered as a plugin).
- Out-of-subset Markdown (headings, images, tables, colour) renders as literal text.
- `Field` context from FE-SHR-008 is not required; pass `invalid` and wrap with `Field` / `FieldError`. Give the external `FieldError` an `id` and pass it as `aria-describedby` so the message is announced. Shortcuts bind on the textarea `onKeyDown`, not `window`.
- The component forwards `ref` to the inner textarea so RHF `Controller` / `register` can focus the control.
