# CardListSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Notification-queue loading shell for `/payments`, `/cancellations`, and `/reschedules`: filter chips plus stacked queue cards that match `AdminQueueCard` rhythm (`min-h-40`, header / body / actions).

## When to use

- Admin request queues that render `<ul className="mt-6 space-y-4">` cards

## When NOT to use

- `AdminDataTable` lists → `TablePageSkeleton`

## Shape props

`label` (required), `items` (default 3 so 360px stays above the fold). Filter chips scroll horizontally below `md` and wrap on tablet+.

## Accessibility

One `role="status"` + `aria-busy` + `aria-label`. Decorative bars `aria-hidden`.
