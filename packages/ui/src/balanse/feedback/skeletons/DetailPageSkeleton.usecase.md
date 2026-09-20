# DetailPageSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Customer-detail loading shell: header, Profile `dl`, then a two-column booking-block body (`md:grid-cols-2`) plus payment history. Used for `/customers/[id]` and as a starting shape for `/bookings/[id]` / `/reports/[id]`.

## Shape props

`label` (required) only. No data.

## Accessibility

One `role="status"` region. Bars `aria-hidden`.
