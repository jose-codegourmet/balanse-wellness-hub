# TablePageSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Layout-accurate loading shell for admin list pages that render `AdminDataTable`. Below the tablet breakpoint it mirrors the mobile card list; at `tablet+` it stays a table placeholder so the loaded UI does not snap.

## When to use

- Admin index routes (`/coaches`, `/customers`, `/classes`, `/bookings`, `/payments` table)
- `loading.tsx` for those routes (`FE-ADM-018`)
- `AdminDataTable`'s in-component `loading` state (`chrome="content"`)

## When NOT to use

- Queue cards (`/cancellations`, `/reschedules`) → `CardListSkeleton`
- Inline stacks → `LocalizedSkeleton`

## Shape props

`label` (required), `rows` (default 4, above-the-fold at 360), `columns` (default 5; table columns, or 0–3 card meta rows after title/subtitle), `leadingCell` (`bar` default, or `avatar` for circular photo placeholders on `/coaches`), `layout` (`auto` | `table` | `cards`, same as `AdminDataTable`), `chrome` (`page` for route skeletons, `content` when the real page title is already on screen). No data props. Do not import `@balanse/mock`.

## Accessibility

One `role="status"` region with `aria-busy` and `aria-label`. Bars are `aria-hidden`. No `Spinner`.
