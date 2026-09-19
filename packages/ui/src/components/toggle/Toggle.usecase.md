# Toggle — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Pressable on/off button for a single option or formatting state.

## When to use

- Icon-only formatting toggle
- Standalone pressed state with text

## When NOT to use

- Several related options → use **ToggleGroup** instead
- Persistent settings → use **Switch** instead
- Primary actions → use **Button** instead

## Examples

### Icon toggle

```tsx
<Toggle aria-label="Toggle bold">
  <BoldIcon />
</Toggle>
```

### Outline with text

```tsx
<Toggle variant="outline">Enable notifications</Toggle>
```

## Gotchas

- `"use client"`; use `aria-label` for icon-only toggles.
