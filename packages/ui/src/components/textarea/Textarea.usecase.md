# Textarea — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Styled multi-line `<textarea>` with focus, invalid, and disabled styles.

## When to use

- Multi-line form fields (bios, comments, descriptions)

## When NOT to use

- Single-line text → use **Input** instead
- Rich text / markdown → use a dedicated editor (not in this set)

## Examples

### Placeholder

```tsx
<Textarea className="max-w-md" placeholder="Type your message here." />
```

### With default value

```tsx
<Textarea
  className="max-w-md"
  rows={4}
  defaultValue="Thanks for reaching out! We will respond within one business day."
/>
```

## Gotchas

- No `"use client"`; wire validation/`aria-invalid` yourself.
