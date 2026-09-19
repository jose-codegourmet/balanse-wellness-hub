# Direction — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Provides LTR/RTL writing direction context for Base UI descendants.

## When to use

- Localizing layouts that must flip for RTL
- Ensuring Base UI popups/menus respect text direction

## When NOT to use

- Pure CSS `dir` when no Base UI context is needed

## Examples

### Wrap content in an RTL context

Set `direction` to `"ltr"` or `"rtl"`.

```tsx
import { DirectionProvider } from "@balanse/ui";
import { Button } from "@balanse/ui";

<DirectionProvider direction="rtl">
  <div className="flex max-w-sm items-center justify-between rounded-xl border p-4">
    <span className="text-sm">Right to left layout</span>
    <Button size="sm" variant="outline">
      Action
    </Button>
  </div>
</DirectionProvider>
```

## Gotchas

- `"use client"` required; thin re-export of `@base-ui/react/direction-provider` only.
