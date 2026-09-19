# Marker — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Inline status/meta line (icon + text) with optional separator or bottom border.

## When to use

- “Updated 2 hours ago” meta rows with an icon
- Centered section dividers (`variant="separator"`)

## When NOT to use

- Full alerts → use **Alert** / **Sonner** instead
- Form labels → use **Label** instead
- Chat chrome → use **Message** / **Bubble** instead

## Examples

### Meta row with icon

```tsx
<Marker>
  <MarkerIcon>
    <InfoIcon />
  </MarkerIcon>
  <MarkerContent>Updated 2 hours ago</MarkerContent>
</Marker>
```

### Section divider

```tsx
<Marker variant="separator">
  <MarkerContent>Section divider</MarkerContent>
</Marker>
```

## Gotchas

- `MarkerIcon` is `aria-hidden`
