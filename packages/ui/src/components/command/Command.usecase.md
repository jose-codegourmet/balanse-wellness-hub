# Command — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Keyboard-first searchable command/menu list (`cmdk`), optionally inside a Dialog as a command palette.

## When to use

- App command palette (search actions, navigate, run commands)
- Inline searchable suggestion lists with groups/shortcuts

## When NOT to use

- Form field selecting a value → use **Combobox** / **Select** instead
- Context/right-click → use **ContextMenu** instead
- Simple button menus → use **DropdownMenu** instead

## Examples

### Searchable command list with groups

Group items with `heading` and add shortcut hints with `CommandShortcut`.

```tsx
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@balanse/ui";
import { UserIcon, CreditCardIcon, SettingsIcon } from "lucide-react";

<Command className="max-w-sm rounded-lg border shadow-md">
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Profile">
      <CommandItem>
        <UserIcon />
        Profile
        <CommandShortcut>⌘P</CommandShortcut>
      </CommandItem>
      <CommandItem>
        <CreditCardIcon />
        Billing
        <CommandShortcut>⌘B</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

## Gotchas

- `"use client"` required.
- Root uses `size-full` / overflow-hidden — parent sizing matters.
