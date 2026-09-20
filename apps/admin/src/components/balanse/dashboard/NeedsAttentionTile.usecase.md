# NeedsAttentionTile — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Action-first queue tile for payment proofs, cancellations, and reschedules. Size encodes priority on the dashboard bento.

## When to use

- Admin `/dashboard` needs-attention block.

## When NOT to use

- The actual queue pages — those use `AdminQueueList`.

## Examples

```tsx
<NeedsAttentionTile items={items} />
```

## Gotchas

- When every count is zero, render the calm “all clear” copy — do not show three empty rows.
- Non-zero counts use the warning badge. Do not treat a rising queue as a positive “up” trend.
