# CalendarSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Month-grid loading shell for `/schedule` and the public/customer `ScheduleCalendar`. Replaces the old six-bar stub. Prop-compatible with `{ className?: string }` — `weeks` and `label` are optional.

## When to use

- `ScheduleCalendar` `loading` prop
- `BalanseQuickBooking` / `BalanseBookingCalendar` loading states

## Shape props

`className`, optional `weeks` (default 5), optional `view` (`day` / `week` / `month`, default `month` — matches `ScheduleCalendar` auto view), optional `label` (default `"Loading schedule"`). Existing callers that pass only `className` stay valid. The shell is `space-y-4` like the loaded calendar, not the old stub card.

## Accessibility

One `role="status"` region. Day cells are decorative (`aria-hidden`). Do not nest `Spinner`.
