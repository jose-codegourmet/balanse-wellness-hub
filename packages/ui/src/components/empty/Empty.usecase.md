# Empty — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Centered empty-state layout (dashed border) for no-data / no-results screens.

## When to use

- Empty inboxes, lists, search-no-results
- First-run states with icon + CTA in `EmptyContent`

## When NOT to use

- Inline "no matches" inside Combobox/Command → use their own Empty instead
- Error boundaries → use dedicated error UI instead

## Examples

### Empty state with icon and actions

Use `EmptyMedia variant="icon"` and put CTAs in `EmptyContent`.

```tsx
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@balanse/ui";
import { Button } from "@balanse/ui";
import { InboxIcon } from "lucide-react";

<Empty className="border">
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <InboxIcon />
    </EmptyMedia>
    <EmptyTitle>No results found</EmptyTitle>
    <EmptyDescription>Try adjusting your filters or search in a wider area.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button size="sm">Browse classes</Button>
    <Button size="sm" variant="outline">
      Reset filters
    </Button>
  </EmptyContent>
</Empty>
```

## Gotchas

- Server-compatible (no `"use client"`).
