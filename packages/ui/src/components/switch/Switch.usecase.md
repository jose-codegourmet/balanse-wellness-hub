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

### Labelled composition

```tsx
<Field orientation="horizontal">
  <FieldContent>
    <FieldLabel>SMS reminders</FieldLabel>
    <FieldDescription>Send a text the morning of the session.</FieldDescription>
  </FieldContent>
  <Switch />
</Field>
```

### Sizes

Canonical size is `md` (alias of `default`). `default` is deprecated but kept so existing callers compile.

```tsx
<Switch size="sm" aria-label="Compact" />
<Switch size="md" aria-label="Default" />
```

## Gotchas

- `"use client"`; Space toggles (Base UI). Provide an accessible name (`FieldLabel` or `aria-label`).
- Value schema: `switchSchema` is `z.boolean()`.
- 44px mobile touch target: `className="max-sm:min-h-11"` on the Field row, not by inflating the thumb.
