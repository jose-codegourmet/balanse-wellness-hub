# Button — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Primary interactive control for actions and links-as-buttons.

## When to use

- Form submits and primary CTAs
- Secondary/outline actions and icon-only controls
- In-flight actions via `loading`

## When NOT to use

- Non-interactive status labels → use **Badge** instead
- Joined toolbars → wrap with **ButtonGroup** instead

## Examples

### Variants and sizes

`variant` covers `default | secondary | outline | ghost | destructive | link`.

Canonical sizes are `sm | md | lg`. `md` is an alias of the historical `default` (`h-8`). Escape hatches kept for Pagination / Calendar / dense chrome: `default`, `xs`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`.

```tsx
import { Button } from "@balanse/ui";

<div className="flex items-center gap-2">
  <Button>Save</Button>
  <Button variant="outline">Cancel</Button>
  <Button variant="destructive">Delete</Button>
  <Button variant="ghost" size="sm">
    Ghost
  </Button>
</div>;
```

### Loading

`loading` swaps in `Spinner` in place of a leading icon, sets `disabled` and `aria-busy`, and keeps the label so width does not jump.

```tsx
<Button loading>Save changes</Button>
```

### Composition via `render` (not `asChild`)

This package uses Base UI. Polymorphism is the `render` prop — there is no Radix `asChild`.

```tsx
import Link from "next/link";

<Button render={<Link href="/pricing" />}>View pricing</Button>;
```

## Gotchas

- Invalid state styles are driven by `aria-invalid`.
- `md` and `default` render identically. Prefer `md` in new code; keep passing `default` where Pagination already does.
- 44px mobile touch target is opt-in: `className="max-sm:min-h-11"`. Do not use `size="lg"` for that.
- Spinner inside a loading button is `aria-hidden` so it does not nest `role="status"` under `aria-busy`.
