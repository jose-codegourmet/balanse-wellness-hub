# AlertDialog — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Modal confirmation that interrupts the flow for destructive or irreversible actions.

## When to use

- Delete / irreversible confirmations
- "Are you sure?" before costly actions

## When NOT to use

- Non-blocking inline messages → use **Alert** instead
- Non-confirm forms or detail panels → use **Dialog** or **Card** instead

## Examples

### Destructive confirmation

The trigger polymorphs into a **Button** via `render`.

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@balanse/ui";
import { Button } from "@balanse/ui";

<AlertDialog>
  <AlertDialogTrigger render={<Button variant="outline" />}>Delete account</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. Your account and all associated data will be permanently
        removed.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

### Compact warning with media icon

`AlertDialogMedia` sits in the header; `size="sm"` tightens the content width.

```tsx
import { AlertTriangleIcon } from "lucide-react";

import { AlertDialogMedia } from "@balanse/ui";

<AlertDialog>
  <AlertDialogTrigger render={<Button size="sm" variant="outline" />}>Sign out</AlertDialogTrigger>
  <AlertDialogContent size="sm">
    <AlertDialogHeader>
      <AlertDialogMedia>
        <AlertTriangleIcon />
      </AlertDialogMedia>
      <AlertDialogTitle>Sign out?</AlertDialogTitle>
      <AlertDialogDescription>
        You will need to sign in again to access your account.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Stay signed in</AlertDialogCancel>
      <AlertDialogAction>Sign out</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>;
```

## Gotchas

- `"use client"` required
- `AlertDialogAction` does **not** auto-close — handle close after confirm yourself
