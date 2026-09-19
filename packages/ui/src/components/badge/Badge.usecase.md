# Badge — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Compact pill label for status, category, or count.

## When to use

- Status chips (New, Error, Beta)
- Category labels
- Inline counts

## When NOT to use

- Primary clickable actions → use **Button** instead
- Multi-line notices → use **Alert** instead

## Examples

### Status variants

`variant` covers `default | secondary | destructive | outline | ghost | link`.

```tsx
import { Badge } from "@balanse/ui";

<div className="flex items-center gap-2">
  <Badge>New</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="destructive">Error</Badge>
  <Badge variant="outline">Outline</Badge>
</div>;
```

### Interactive badge

Use `render` to polymorph the default `span` into an anchor or button.

```tsx
<Badge variant="outline" render={<a href="/changelog" />}>
  Changelog
</Badge>
```

## Gotchas

- Default element is `span` — use `render` to polymorph into `a` / `button` when interactive
