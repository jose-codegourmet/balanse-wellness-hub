# HoverCard — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Hover/focus preview card anchored to a trigger (Base UI PreviewCard).

## When to use

- User/profile previews on hover
- Lightweight enrichment of links/buttons

## When NOT to use

- Click-required or long forms → use **Popover** / **Dialog** instead
- Dense action menus → use **DropdownMenu** instead

## Examples

### Profile preview on hover

Trigger polymorphs into a link-styled **Button** via `render`.

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@balanse/ui";
import { Button } from "@balanse/ui";

<HoverCard>
  <HoverCardTrigger render={<Button variant="link" className="px-0" />}>
    @balanse
  </HoverCardTrigger>
  <HoverCardContent>
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Balansé</h4>
      <p className="text-sm text-muted-foreground">
        Smart matching for members and trusted sitters in your neighborhood.
      </p>
    </div>
  </HoverCardContent>
</HoverCard>
```

## Gotchas

- `"use client"` required; hover/focus only — not primary navigation.
