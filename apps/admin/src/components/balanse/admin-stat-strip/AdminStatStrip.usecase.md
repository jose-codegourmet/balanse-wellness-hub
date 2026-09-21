# AdminStatStrip — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Five headline dashboard counts as individual bento tiles. Counts only — no sparkline and no trend arrow.

## When to use

- Admin `/dashboard` headline counts: Today’s Classes, Pending Payments, Cancellations, Reschedules, Waitlisted.

## When NOT to use

- Financial cards or charts. Those are separate tiles.
- Any invented comparison. Queue depth has no prior window (BE-054).

## Examples

```tsx
<DashboardBento>
  <AdminStatStrip stats={stats} />
</DashboardBento>
```

## Gotchas

- Must render as a fragment of `DashboardTile`s so the parent 12 / 6 / 1 grid owns placement.
- Do not reintroduce `sparkBars` or green “up” arrows on pending queues.
