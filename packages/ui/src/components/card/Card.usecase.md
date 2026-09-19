# Card — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Bordered content container with optional header, body, action, and footer.

## When to use

- Feature/summary blocks with title + description
- Forms or settings sections with a muted footer
- Header actions via `CardAction`

## When NOT to use

- Modal confirms → use **AlertDialog** / **Dialog** instead
- Inline status banners → use **Alert** instead
- Tiny status labels → use **Badge** instead

## Examples

### Basic card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@balanse/ui";

<Card className="w-[350px]">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content area for details, metrics, or supporting copy.</p>
  </CardContent>
</Card>
```

### With footer actions

```tsx
<Card className="w-[350px]">
  <CardHeader>
    <CardTitle>Notifications</CardTitle>
    <CardDescription>You have 3 unread messages.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Review your latest updates and mark items as read.</p>
  </CardContent>
  <CardFooter className="justify-end gap-2">
    <Button variant="outline" size="sm">Dismiss</Button>
    <Button size="sm">View all</Button>
  </CardFooter>
</Card>
```

## Gotchas

- `CardAction` expects to live in `CardHeader` for grid placement.
