# DashboardTile — Use Cases

> Part of the [Component Usage Guide](../../../../../../../docs/component-guide.md).

## Purpose

One bento cell. `span` maps to the 12 / 6 / 1 column contract so ops tiles stay larger than analytics.

## When to use

- Direct children of `DashboardBento`.

## When NOT to use

- Standalone cards outside the dashboard grid.

## Examples

```tsx
<DashboardTile span="attention">…</DashboardTile>
<DashboardTile span="stat" href="/payments">Pending Payments</DashboardTile>
```

## Gotchas

- `attention` and `schedule` are the large spans. Do not give a chart `attention` or `schedule`.
- Linked tiles put the whole surface on the anchor. Do not nest another interactive control inside.
