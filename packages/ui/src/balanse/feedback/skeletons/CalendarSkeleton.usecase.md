# CalendarSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Responsive loading shell for `/schedule` and the public/customer `ScheduleCalendar`. Default `view="auto"` follows `useBreakpoint()` with the same rule as `detectView()`: day agenda below 768, week strip at 768, month grid at 1280.

## When to use

- `ScheduleCalendar` `loading` prop
- `BalanseQuickBooking` / `BalanseBookingCalendar` loading states
- Admin `/schedule` `loading.tsx`

## Shape props

`className`, optional `weeks` (default 5), optional `view` (`day` / `week` / `month` / `auto`, default `auto`), optional `label` (default `"Loading schedule"`). Pin `view` in stories. The side panel stacks under the calendar below `xl` (`xl:grid-cols-[minmax(0,1fr)_22rem]`), matching `ScheduleListPage`.

## Accessibility

One `role="status"` region. Day cells are decorative (`aria-hidden`). Do not nest `Spinner`.
