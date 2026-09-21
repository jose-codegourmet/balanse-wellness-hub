# Field — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Composition helpers for labeling, laying out, and showing errors around form controls. `Field` owns a context that wires `aria-invalid` and `aria-describedby` onto participating controls.

Visual rhythm is always **label → control → description → error**. `orientation="horizontal"` is for switch/checkbox rows: the control and label sit on one line; description and error wrap full width so they do not break the column.

## When to use

- Consistent label/description/error structure around Input/Select/Checkbox/Switch/etc.
- Horizontal or responsive label+control rows
- RHF (or any form lib) error surfaces via `FieldError`

## When NOT to use

- As a form store / RHF replacement (this is layout/a11y chrome only)
- Marketing CTAs that are not form fields

## Examples

### Invalid field

Pass `invalid` on `Field`. Do **not** add a second description component — use the existing `FieldDescription`.

```tsx
import { Field, FieldDescription, FieldError, FieldLabel, Input } from "@balanse/ui";

<Field className="max-w-sm" invalid>
  <FieldLabel>Password</FieldLabel>
  <Input type="password" defaultValue="short" />
  <FieldDescription>Use at least 8 characters.</FieldDescription>
  <FieldError>Password must be at least 8 characters.</FieldError>
</Field>
```

### Labelled checkbox composition (for #209)

```tsx
<Field orientation="horizontal">
  <Checkbox />
  <FieldContent>
    <FieldLabel>Email me about waitlist openings</FieldLabel>
    <FieldDescription>We only send one message per class.</FieldDescription>
  </FieldContent>
</Field>
```

### Context shape (for #201 RichTextarea)

`useFieldContext()` returns `undefined` outside a `Field`. Inside a `Field` it is:

`{ id, descriptionId, errorId, invalid, disabled, describedBy }`.

Controls should apply `id`, `aria-invalid`, and `aria-describedby` from that object when the consumer does not pass their own.

## Gotchas

- `"use client"` required.
- `data-invalid` is derived from the `invalid` prop (`true` or omitted). Do not set `data-invalid` by hand.
- `FieldError` still returns `null` when empty (no children and no `errors`).
- `useFieldContext()` is safe on bare `<Input>` call sites — it returns `undefined`.
- 44px mobile touch target is an opt-in: `className="max-sm:min-h-11"` on the control. Do not inflate `md` (`h-8`). The admin form kit (#209) should use this recipe for dense-to-touch upgrades.
- Size scale for participating controls is `sm | md | lg`. `md` matches today's default rendering.
- New controls must adopt `controlSurfaceVariants` / `controlIndicatorStates` from `packages/ui/src/lib/control-surface.ts` (FE-SHR-016). Do not invent a second border/focus/invalid recipe.
