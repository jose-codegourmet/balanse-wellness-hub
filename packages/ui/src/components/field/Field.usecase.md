# Field — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Composition helpers for labeling, laying out, and showing errors around form controls.

## When to use

- Consistent label/description/error structure around Input/Select/etc.
- Horizontal or responsive label+control rows

## When NOT to use

- As a form store / RHF replacement (this is layout/a11y chrome only)

## Examples

### Field with error

Set `data-invalid` on Field and use `FieldError` for the message.

```tsx
import { Field, FieldError, FieldLabel } from "@balanse/ui";
import { Input } from "@balanse/ui";

<Field className="max-w-sm" data-invalid="true">
  <FieldLabel htmlFor="password">Password</FieldLabel>
  <Input id="password" type="password" aria-invalid defaultValue="short" />
  <FieldError>Password must be at least 8 characters.</FieldError>
</Field>
```

### Grouped fields

Use `FieldSet` + `FieldLegend` + `FieldGroup` to group related inputs.

```tsx
import { FieldSet, FieldLegend, FieldGroup, Field, FieldLabel } from "@balanse/ui";
import { Input } from "@balanse/ui";

<FieldSet className="max-w-sm">
  <FieldLegend>Contact details</FieldLegend>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="first-name">First name</FieldLabel>
      <Input id="first-name" placeholder="Alex" />
    </Field>
  </FieldGroup>
</FieldSet>
```

## Gotchas

- `"use client"` required; set `data-invalid` on Field for destructive text styling; `FieldError` returns null when empty.
