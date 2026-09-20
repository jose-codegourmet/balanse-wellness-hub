# SalesSeriesChart — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

One honest chart tile: trailing Manila-day gross sales derived from existing bookings (`countsTowardGrossSales`). Composition lives here; vendored Jabkit `chart` stays pristine.

## When to use

- Admin `/dashboard` when `AdminDashboardSnapshot.series.gross_sales` is present.

## When NOT to use

- Queue depths, occupancy, or coach cost — those are not this tile. Occupancy / session-count / coach-cost charts wait on BE-054 if the mock cannot derive them.
- Do not invent a series. If the adapter did not attach one, omit the tile.

## Examples

```tsx
{data.series?.gross_sales ? <SalesSeriesChart series={data.series.gross_sales} /> : null}
```

## Gotchas

- Colour is not the only distinction: the adjacent day list is the text alternative.
- No date-range control. The window is the adapter’s 14-day series.
- Coach cost must never appear in this chart’s accessible name.
