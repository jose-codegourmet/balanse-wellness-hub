# CardListSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Notification-queue loading shell for `/payments` side panels, `/cancellations`, and `/reschedules`: stacked bordered cards with action rows.

## When to use

- Admin request queues that render `<ul className="mt-6 space-y-4">` cards

## When NOT to use

- `AdminDataTable` lists → `TablePageSkeleton`

## Shape props

`label` (required), `items` (default 3 so 360px stays above the fold). No data. No `@balanse/mock`.

## Accessibility

One `role="status"` + `aria-busy` + `aria-label`. Decorative bars `aria-hidden`.
