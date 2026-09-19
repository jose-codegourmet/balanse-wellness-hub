# Checkbox — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Binary checked control with check indicator for forms and filters.

## When to use

- Multi-select form options
- Filter lists with independent choices

## When NOT to use

- Exclusive single choice → use **RadioGroup** instead
- Settings on/off with switch UX → use **Switch** instead

## Examples

### Checkbox with a label

Pair with **Label** via `id` / `htmlFor` so the text is clickable.

```tsx
import { Checkbox } from "@balanse/ui";
import { Label } from "@balanse/ui";

<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>;
```

### Preset and disabled states

Use `defaultChecked` for uncontrolled state and `disabled` for locked options.

```tsx
<Checkbox defaultChecked aria-label="Checked checkbox" />
<Checkbox disabled aria-label="Disabled checkbox" />
```

## Gotchas

- `"use client"` required
- Pair with a **Label** (or provide `aria-label`) for an accessible name
