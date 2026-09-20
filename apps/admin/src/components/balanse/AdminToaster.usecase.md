# AdminToaster — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Single admin toast viewport over the vendored Jabkit Base-UI toaster. Screens raise copy through `notify` / `notify.admin`, not by importing the Jabkit module.

## When to use

- Mounted once in `Providers` (already done)
- Storybook snapshots that need `disablePortal`

## When NOT to use

- Do not mount a second toaster in a screen
- Do not use `@balanse/ui` Sonner — the portal already chose Jabkit
- Do not invent toast strings when an `ADMIN_TOAST_IDS` entry exists

## Examples

```tsx
import { notify } from "@/modules/notifications/notify";

notify.admin("class.saved");
notify.error({ title: "Class not saved", description: "Try again." });
```

## Gotchas

- `Providers` already wraps Storybook, so interactive stories drive the existing surface.
- `disablePortal` is for isolated snapshots only — it would duplicate toasts if stacked on top of `Providers`.
