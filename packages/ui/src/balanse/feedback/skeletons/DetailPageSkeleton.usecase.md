# DetailPageSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Customer-detail loading shell: header, Profile summary first, then stacked booking blocks and payment history. Single column at every width — matches `/customers/[id]`. Used for `/customers/[id]` and as a starting shape for `/bookings/[id]` / `/reports/[id]`.

## Shape props

`label` (required) only. No data.

## Accessibility

One `role="status"` region. Bars `aria-hidden`.
