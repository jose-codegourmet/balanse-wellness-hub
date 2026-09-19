# Switch — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Binary on/off control with sliding thumb.

## When to use

- Settings toggles (notifications, features)
- Compact boolean form controls

## When NOT to use

- Multi-option exclusive choice → use **RadioGroup** / **ToggleGroup** instead
- Instant toolbar formatting → use **Toggle** instead
- Tri-state / list selection → use **Checkbox** instead

## Examples

### Default

```tsx
<Switch aria-label="Toggle setting" />
```

### Checked by default

```tsx
<Switch defaultChecked aria-label="Checked switch" />
```

## Gotchas

- `"use client"`; provide an accessible name (`aria-label` or Label).
