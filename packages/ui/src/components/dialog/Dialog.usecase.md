# Dialog — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Centered modal overlay for focused tasks, confirmations, and short forms.

## When to use

- Short edit forms, alerts requiring focus trap
- Centered modal content (not a side panel)

## When NOT to use

- Edge-anchored panels → use **Sheet** instead
- Swipeable / snap-point sheets → use **Drawer** instead
- Destructive confirm-only → use **AlertDialog** instead

## Examples

### Modal with footer actions

Trigger polymorphs into a **Button** via `render`.

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@balanse/ui";
import { Button } from "@balanse/ui";

<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>Share link</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Share this project</DialogTitle>
      <DialogDescription>
        Anyone with the link can view this project in read-only mode.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Copy link</Button>
      <Button>Send invite</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Gotchas

- `"use client"` required; Content is fixed centered (`max-w-sm` on sm+).
