# DropdownMenu — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Click/hover-triggered action menu anchored to a control.

## When to use

- "More actions" / overflow menus
- Account menus with shortcuts and destructive items

## When NOT to use

- Right-click → use **ContextMenu** instead
- Form field value → use **Select** / **Combobox** instead
- Command palette → use **Command** instead

## Examples

### Account menu with shortcut

Item `variant="destructive"` styles dangerous actions.

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@balanse/ui";
import { Button } from "@balanse/ui";

<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="outline" />}>Open menu</DropdownMenuTrigger>
  <DropdownMenuContent className="w-48">
    <DropdownMenuGroup>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Billing</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      Log out
      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Gotchas

- `"use client"` required; structurally parallel to ContextMenu but click-triggered.
