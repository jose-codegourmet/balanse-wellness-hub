# CountBadge — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Numeric pill with `tabular-nums`, a stable min-width, and a spoken `aria-label`. Overflows as `99+` when `count` exceeds `max`.

## When to use

- Sidebar or nav pending counts (`FE-ADM-016` / `AdminSidebar`)
- Compact numeric indicators that must not jitter as the value changes

## When NOT to use

- Status vocabulary → use **StatusBadge**
- Non-numeric labels → use **Badge**

## Examples

```tsx
import { CountBadge } from "@balanse/ui";

<CountBadge count={3} aria-label="3 pending bookings" />
<CountBadge count={142} max={99} aria-label="142 pending bookings" />
```

## Gotchas

- Default `aria-label` is `` `${count} items` `` — pass a domain-specific label in product surfaces
- Built on `Badge` (`neutral` / `soft` / `sm`); keep the min-width when overriding `className`
- `AdminSidebar.tsx` still hand-rolls count pills — adopt this recipe in #205 (`FE-ADM-016`)
