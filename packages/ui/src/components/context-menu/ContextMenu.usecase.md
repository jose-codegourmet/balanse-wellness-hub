# ContextMenu — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Right-click (context) menu with items, checkboxes, radios, and nested submenus.

## When to use

- Right-click actions on canvas, list rows, media, or editors
- Contextual checkboxes/radios and nested submenus

## When NOT to use

- Button-triggered menus → use **DropdownMenu** instead
- Form option selection → use **Select** / **Combobox** instead

## Examples

### Right-click actions with shortcuts

Item `variant="destructive"` styles dangerous actions.

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@balanse/ui";

<ContextMenu>
  <ContextMenuTrigger className="flex h-[160px] w-[320px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
    Right click here
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>
      Back
      <ContextMenuShortcut>⌘[</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem>Reload</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## Gotchas

- `"use client"` required.
