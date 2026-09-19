# Item — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Flexible list-row / media-object building blocks for notifications, digests, and selectable rows.

## When to use

- Notification or feed rows (icon/image + title + description)
- Compact rows inside menus (`size="xs"`)
- Grouped lists with separators and actions

## When NOT to use

- Form field layout → use **Field** instead
- Empty states → use **Empty** instead
- Menu primitives → use **DropdownMenu** / **Command** items instead

## Examples

### Notification row with media and actions

Compose `ItemMedia`, `ItemContent`, and `ItemActions` inside an `ItemGroup`.

```tsx
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@balanse/ui";
import { Button } from "@balanse/ui";
import { MailIcon, MoreHorizontalIcon } from "lucide-react";

<ItemGroup className="max-w-md">
  <Item variant="muted">
    <ItemMedia variant="icon">
      <MailIcon />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>Match request</ItemTitle>
      <ItemDescription>Bailey&apos;s owner wants to schedule a playdate.</ItemDescription>
    </ItemContent>
    <ItemActions>
      <Button size="icon-sm" variant="ghost">
        <MoreHorizontalIcon />
      </Button>
    </ItemActions>
  </Item>
</ItemGroup>
```

## Gotchas

- `ItemGroup` uses `role="list"`.
