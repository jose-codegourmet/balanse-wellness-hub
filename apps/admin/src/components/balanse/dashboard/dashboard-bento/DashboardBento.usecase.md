# DashboardBento — Use Cases

> Part of the [Component Usage Guide](../../../../../../../docs/component-guide.md).

## Purpose

12 / 6 / 1 column bento for the admin dashboard. Children declare their own spans via `DashboardTile`.

## When to use

- `/dashboard` only. Operational tiles (needs-attention, today's schedule) must be the largest children.

## When NOT to use

- Reports, queues, or any page that is not the dashboard bento.
- Date-range or drag-to-rearrange chrome — those are out of scope.

## Examples

```tsx
<DashboardBento>
  <DashboardTile span="attention">…</DashboardTile>
  <DashboardTile span="schedule">…</DashboardTile>
</DashboardBento>
```

## Gotchas

- DOM order is the mobile order: actions before analytics. Dense placement on `md+` keeps ops tiles large.
- Keep `BentoSkeleton` tile spans in `dashboardBentoSkeletonTiles` in lockstep with `dashboardTileSpanClass`.
