# Alert — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Inline, non-modal status banner with optional icon and trailing action.

## When to use

- Form/API error or success banners on a page
- Destructive warnings that stay in layout flow

## When NOT to use

- Actions needing focus trap and confirmation → use **AlertDialog** instead
- Compact status labels → use **Badge** instead
- Ephemeral toasts → use **Sonner** instead

## Examples

### Informational banner with icon

Adding a child `svg` switches the layout to an icon + text grid.

```tsx
import { InfoIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@balanse/ui";

<Alert className="max-w-lg">
  <InfoIcon />
  <AlertTitle>New matches available</AlertTitle>
  <AlertDescription>
    Three members near you are looking for playdates this weekend.
  </AlertDescription>
</Alert>;
```

### Destructive error banner

Use `variant="destructive"` for failures that stay in the page flow.

```tsx
<Alert variant="destructive" className="max-w-lg">
  <InfoIcon />
  <AlertTitle>Unable to save changes</AlertTitle>
  <AlertDescription>Your session expired. Please sign in again and retry.</AlertDescription>
</Alert>
```

## Gotchas

- Presence of a child `svg` switches layout to an icon+text grid
