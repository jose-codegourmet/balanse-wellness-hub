# Avatar — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Circular user/entity image with fallback initials and optional status badge or stacked group.

## When to use

- Profile photos with initials fallback
- Participant stacks; online indicators via `AvatarBadge`

## When NOT to use

- Arbitrary fixed-ratio media → use **AspectRatio** instead
- File thumbnails with metadata → use **Attachment** instead

## Examples

### Image with initials fallback

Include both so Base UI can swap to initials when the image fails to load.

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@balanse/ui";

<Avatar>
  <AvatarImage src="/images/brand/logo-balanse-icon.png" alt="Balansé" />
  <AvatarFallback>PP</AvatarFallback>
</Avatar>;
```

### Sizes

Root `size` accepts `"sm" | "default" | "lg"`.

```tsx
<div className="flex items-center gap-4">
  <Avatar size="sm">
    <AvatarFallback>S</AvatarFallback>
  </Avatar>
  <Avatar size="default">
    <AvatarFallback>M</AvatarFallback>
  </Avatar>
  <Avatar size="lg">
    <AvatarFallback>L</AvatarFallback>
  </Avatar>
</div>
```

## Gotchas

- `"use client"` required
- Prefer Image + Fallback together so Base UI can swap on load failure
