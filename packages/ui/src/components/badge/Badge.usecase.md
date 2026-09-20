# Badge — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Compact semantic chip with a real surface, fixed height, and optional dot or icon. Colour is never the only signal — pair a variant with appearance, a dot, or an icon.

## When to use

- Status chips that are not domain statuses (use **StatusBadge** for booking/refund vocabulary)
- Category or environment labels
- Inline counts via **CountBadge**

## When NOT to use

- Primary clickable actions → use **Button** instead
- Booking or refund status vocabulary → use **StatusBadge** instead
- Numeric nav pills → use **CountBadge** instead
- Multi-line notices → use **Alert** instead

## Examples

### Semantic variants

`variant` is `neutral | info | success | warning | danger | accent`. Each has `solid` and `soft` appearances, and `sm | md` sizes.

```tsx
import { Badge } from "@balanse/ui";

<div className="flex items-center gap-2">
  <Badge variant="success" appearance="soft">
    Confirmed
  </Badge>
  <Badge variant="warning" appearance="solid" size="sm" dot>
    Reserved — Payment Needed
  </Badge>
</div>;
```

### Interactive badge

Use `render` to polymorph the default `span` into an anchor or button.

```tsx
<Badge variant="info" appearance="soft" render={<a href="/changelog" />}>
  Changelog
</Badge>
```

## Gotchas

- Default element is `span` — use `render` to polymorph into `a` / `button` when interactive
- `success`, `warning`, and `info` have no dedicated tokens in `@balanse/config`; they are `color-mix` derivations from navy, tan, gold, and primary. `danger` uses `--destructive`. `accent` uses `--accent`.
- Admin staff and session chips use `Badge` with an explicit variant map (`dot`, `appearance="solid"`, `size="sm"`). Booking statuses use `StatusBadge surface="admin"`. Do not pass staff or session enums to `StatusBadge`.
