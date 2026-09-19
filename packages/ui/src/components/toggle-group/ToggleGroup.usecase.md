# ToggleGroup — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Group of toggles sharing variant/size via context; values are arrays.

## When to use

- Formatting toolbars (bold/italic/underline)
- Alignment or view-mode pickers (list/grid)

## When NOT to use

- Single isolated press → use **Toggle** instead
- Settings boolean → use **Switch** instead
- One-of-many with long labels → use **RadioGroup** / **Select** instead

## Examples

### Formatting toolbar

```tsx
<ToggleGroup defaultValue={["bold"]}>
  <ToggleGroupItem value="bold" aria-label="Toggle bold">
    <BoldIcon />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Toggle italic">
    <ItalicIcon />
  </ToggleGroupItem>
  <ToggleGroupItem value="underline" aria-label="Toggle underline">
    <UnderlineIcon />
  </ToggleGroupItem>
</ToggleGroup>
```

### Outline alignment picker

```tsx
<ToggleGroup variant="outline" defaultValue={["center"]}>
  <ToggleGroupItem value="left">Left</ToggleGroupItem>
  <ToggleGroupItem value="center">Center</ToggleGroupItem>
  <ToggleGroupItem value="right">Right</ToggleGroupItem>
</ToggleGroup>
```

## Gotchas

- `"use client"`; `spacing={0}` enables segmented (joined) borders.
