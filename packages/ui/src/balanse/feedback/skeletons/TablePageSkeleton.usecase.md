# TablePageSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Layout-accurate loading shell for admin list pages that render `AdminDataTable`: header, search toolbar, N×M grid, pagination bar.

## When to use

- Admin index routes (`/coaches`, `/customers`, `/classes`, `/bookings`, `/payments` table)
- `loading.tsx` for those routes (`FE-ADM-018`)

## When NOT to use

- Queue cards (`/cancellations`, `/reschedules`) → `CardListSkeleton`
- Inline stacks → `LocalizedSkeleton`

## Shape props

`label` (required), `rows` (default 4, above-the-fold at 360), `columns` (default 5), `leadingCell` (`bar` default, or `avatar` for circular photo placeholders on `/coaches`). No data props. Do not import `@balanse/mock`.

## Accessibility

One `role="status"` region with `aria-busy` and `aria-label`. Bars are `aria-hidden`. No `Spinner`.
