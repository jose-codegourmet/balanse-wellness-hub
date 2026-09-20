# BentoSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Dashboard loading shell. Copies `/dashboard` 12 / 6 / 1 column spans: Needs Attention and Today's Schedule are the large tiles; headline counts, the sales chart, and financial cards are secondary.

## When to use

- Admin `/dashboard` `loading.tsx` and the dashboard early-return

## When NOT to use

- Table or form routes — use `TablePageSkeleton` / `FormPageSkeleton`.

## Examples

```tsx
<BentoSkeleton label="Loading dashboard" tiles={dashboardBentoSkeletonTiles} />
```

## Gotchas

- Pass the same `span` classes as the live `DashboardTile`s. A numeric `tiles` value only produces equal metric cells.
- One `role="status"` region. Inner bars stay `aria-hidden`.
