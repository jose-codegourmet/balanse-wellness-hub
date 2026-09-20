# Checkbox — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Binary (or indeterminate) checked control for forms and filters.

## When to use

- Multi-select form options
- Filter lists with independent choices
- “Select all” parents via `indeterminate`

## When NOT to use

- Exclusive single choice → use **RadioGroup** instead
- Settings on/off with switch UX → use **Switch** instead

## Examples

### Labelled composition (replaces raw `<label><input type="checkbox">`)

```tsx
import { Checkbox, Field, FieldContent, FieldDescription, FieldLabel } from "@balanse/ui";

<Field orientation="horizontal">
  <Checkbox />
  <FieldContent>
    <FieldLabel>Email me about waitlist openings</FieldLabel>
    <FieldDescription>We only send one message per class.</FieldDescription>
  </FieldContent>
</Field>

<FieldLabel>
  <Field orientation="horizontal">
    <Checkbox defaultChecked />
    <FieldContent>
      <FieldTitle>SMS reminders</FieldTitle>
      <FieldDescription>Wrap Field in FieldLabel to reach has-data-checked card styles.</FieldDescription>
    </FieldContent>
  </Field>
</FieldLabel>
```

### Indeterminate

Use Base UI’s `indeterminate` on the root — do not invent a third checked value.

```tsx
<Checkbox indeterminate aria-label="Select all" />
```

## Gotchas

- `"use client"` required.
- Space toggles the control (Base UI). Pair with `Field` so the label is clickable via `htmlFor`.
- Value schema: `checkboxSchema` is `z.boolean()`.
- 44px hit area already comes from the `after:-inset-*` affordance; still wrap with Field for the label.
