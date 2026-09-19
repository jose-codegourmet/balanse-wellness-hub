# Collapsible — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Toggles showing/hiding a single content panel when its trigger is activated.

## When to use

- Expand/collapse inline sections ("read more", order details)
- Progressive disclosure without a modal

## When NOT to use

- Multi-item exclusive FAQ → use **Accordion** instead
- Overlay content → use **Dialog** / **Drawer** / **Sheet** instead

## Examples

### Order summary panel

Compose the trigger with a **Button** via `render`.

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@balanse/ui";
import { Button } from "@balanse/ui";
import { ChevronsUpDownIcon } from "lucide-react";

<Collapsible className="w-[360px] space-y-2">
  <div className="flex items-center justify-between gap-4 px-1">
    <h4 className="text-sm font-medium">Order summary</h4>
    <CollapsibleTrigger render={<Button variant="ghost" size="icon-xs" />}>
      <ChevronsUpDownIcon />
      <span className="sr-only">Toggle</span>
    </CollapsibleTrigger>
  </div>
  <div className="rounded-lg border px-4 py-2 text-sm">3 items · $129.00</div>
  <CollapsibleContent className="space-y-2">
    <div className="rounded-lg border px-4 py-2 text-sm">Premium harness · $49.00</div>
    <div className="rounded-lg border px-4 py-2 text-sm">Travel bowl · $24.00</div>
  </CollapsibleContent>
</Collapsible>
```

## Gotchas

- `"use client"` required.
