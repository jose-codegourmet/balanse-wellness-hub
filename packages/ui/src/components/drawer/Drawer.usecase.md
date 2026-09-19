# Drawer — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Swipeable edge-anchored panel with optional snap points (Base UI Drawer, not vaul).

## When to use

- Bottom sheets / swipe-to-dismiss mobile flows
- Snap-point drawers (partial → full height)

## When NOT to use

- Centered modals → use **Dialog** instead
- Static side panels without swipe → use **Sheet** instead

## Examples

### Drawer with footer actions

Trigger and Close polymorph into **Button** via `render`.

```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@balanse/ui";
import { Button } from "@balanse/ui";

<Drawer>
  <DrawerTrigger render={<Button variant="outline" />}>Edit profile</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Edit class profile</DrawerTitle>
      <DrawerDescription>Update your practice&apos;s details and preferences.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button>Save changes</Button>
      <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

## Gotchas

- `"use client"` required; Content must be inside `Drawer`; overlay only when `modal === true`.
