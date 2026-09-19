# Button — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Primary interactive control for actions and links-as-buttons.

## When to use

- Form submits and primary CTAs
- Secondary/outline actions and icon-only controls

## When NOT to use

- Non-interactive status labels → use **Badge** instead
- Joined toolbars → wrap with **ButtonGroup** instead

## Examples

### Variants and sizes

`variant` covers `default | outline | secondary | ghost | destructive | link`; `size` covers `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`.

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

### Link rendered as a button

Base UI `render` polymorphism keeps the styling while changing the element.

```tsx
import Link from "next/link";

<Button render={<Link href="/pricing" />}>View pricing</Button>;
```

## Gotchas

- Invalid state styles are driven by `aria-invalid`
