# Textarea — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Styled multi-line `<textarea>` with shared sizes, distinct read-only/disabled treatments, and optional height sync.

## When to use

- Multi-line form fields (bios, comments, descriptions)

## When NOT to use

- Single-line text → use **Input** instead
- Rich text / markdown → use **RichTextarea** (`FE-SHR-010`)

## Examples

### Default rows and sizes

`rows` defaults to `3`. `md` keeps today’s `min-h-16`.

```tsx
<Textarea className="max-w-md" placeholder="Type your message here." />
<Textarea size="lg" rows={6} />
```

### Auto-resize

`autoResize` syncs height from `scrollHeight` so Firefox and Safari match Chromium. `field-sizing-content` remains as a progressive enhancement.

```tsx
<Textarea autoResize placeholder="Keeps growing as you type." />
```

## Gotchas

- `"use client"` because of `useFieldContext()` and the resize effect.
- `readOnly` is muted (`bg-muted/50`) and still focusable; `disabled` is faded and not editable.
- 44px mobile touch target: `className="max-sm:min-h-11"` (usually unnecessary on textarea).
- Value schema: `textareaSchema` is `z.string()`.
