# Sonner (Toaster) — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Theme-aware toast host wrapping the `sonner` library’s `Toaster`.

## When to use

- App-wide ephemeral notifications via `toast()` / `toast.success()` / `toast.error()` from `sonner`

## When NOT to use

- Inline persistent messages → use **Alert** instead
- Blocking confirmations → use **Dialog** / **AlertDialog** instead

## Examples

### Default toast

```tsx
import { toast } from "sonner";
import { Toaster } from "@balanse/ui";

<>
  <Button onClick={() => toast("Your changes have been saved.")}>Show toast</Button>
  <Toaster />
</>
```

### Success toast

```tsx
<Button
  onClick={() =>
    toast.success("Profile updated", {
      description: "Your class profile is now live.",
    })
  }
>
  Show success
</Button>
```

## Gotchas

- `"use client"`; mount `<Toaster />` once (typically in layout); call `toast` from `sonner`, not from this file.
