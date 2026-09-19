# Slider — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Range input with track, filled indicator, and one or more thumbs.

## When to use

- Single continuous value or dual-thumb ranges

## When NOT to use

- Discrete option picking → use **Select** / **ToggleGroup** instead

## Examples

### Single value

```tsx
<Slider className="max-w-sm" defaultValue={[33]} />
```

### Dual-thumb range

```tsx
<Slider className="max-w-sm" defaultValue={[25, 75]} />
```

## Gotchas

- If neither `value` nor `defaultValue` is an array, thumbs default to `[min, max]` (two thumbs); vertical needs height; must be used from a client boundary.
