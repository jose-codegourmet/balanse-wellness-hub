# RadioGroup — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Mutually exclusive radio options with accessible keyboard behavior.

## When to use

- Single-choice settings (density, plan billing)
- Options with helper text beside Label

## When NOT to use

- Multi-select → use **Checkbox** instead
- Many options in a compact trigger → use **Select** / **NativeSelect** instead

## Examples

### Labelled composition

```tsx
<RadioGroup defaultValue="comfortable">
  <Field orientation="horizontal">
    <RadioGroupItem value="default" />
    <FieldLabel>Default</FieldLabel>
  </Field>
  <Field orientation="horizontal">
    <RadioGroupItem value="comfortable" />
    <FieldContent>
      <FieldLabel>Comfortable</FieldLabel>
      <FieldDescription>Roomier padding in admin tables.</FieldDescription>
    </FieldContent>
  </Field>
</RadioGroup>
```

## Gotchas

- `"use client"`; arrow keys move within the group and Space selects (Base UI).
- Value schema: `radioGroupSchema` is `z.string()`.
- Nest each option in `Field orientation="horizontal"` so `FieldLabel` + `has-data-checked` styles apply.
