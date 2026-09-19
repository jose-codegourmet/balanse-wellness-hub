# InputGroup — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Composite control wrapping Input/Textarea with aligned addons (icons, buttons, prefixes).

## When to use

- Search fields with leading icon
- Prefixed/suffixed inputs or textarea toolbars

## When NOT to use

- Plain single input → use **Input** instead
- OTP → use **InputOTP** instead

## Examples

### Search field with leading icon

Place addons with `InputGroupAddon` and set `align` to position them.

```tsx
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@balanse/ui";
import { SearchIcon } from "lucide-react";

<InputGroup className="max-w-sm">
  <InputGroupAddon>
    <SearchIcon />
  </InputGroupAddon>
  <InputGroupInput placeholder="Search..." />
</InputGroup>
```

### Trailing action button

```tsx
<InputGroup className="max-w-sm">
  <InputGroupInput placeholder="Enter your email" type="email" />
  <InputGroupAddon align="inline-end">
    <InputGroupButton>Subscribe</InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

## Gotchas

- `"use client"` required; clicking an Addon focuses the inner input (unless target is a button); focus/invalid rings live on the group.
