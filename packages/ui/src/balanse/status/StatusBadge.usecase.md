# StatusBadge — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Domain-aware booking and refund status chip. Labels come from `@balanse/domain` `customerStatusLabel` — vocabulary is frozen by `FE-SHR-002`. Surfaces only change appearance (`soft` customer / `solid` admin), never wording.

## When to use

- Portal booking cards and booking detail
- Admin booking, roster, payment, and customer surfaces that already call `StatusBadge`
- Table cells via `StatusBadgeCell` (`surface="admin"`)

## When NOT to use

- Generic category chips → use **Badge**
- Numeric pills → use **CountBadge**
- Admin dashboard table cells still owned by `AdminStatusBadge` until #207

## Examples

```tsx
import { StatusBadge } from "@balanse/ui";

<StatusBadge status="HELD_AWAITING_PAYMENT" />
<StatusBadge status="CONFIRMED" surface="admin" />
```

## Gotchas

- Throws if a raw enum token reaches the DOM (`isRawStatusToken`)
- Do not change label strings here — edit `packages/domain/src/status-language.ts` only under a vocabulary ticket
- Terminal-negative statuses (`CANCELLED`, `REJECTED`, `EXPIRED`, `NO_SHOW`) keep `line-through`; icons remain the colour-independent signal
- `text-[0.65rem]` / `text-[0.7rem]` abbreviations were removed; do not reintroduce off-scale type
