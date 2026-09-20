# CalendarSkeleton — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Month-grid loading shell for `/schedule` and the public/customer `ScheduleCalendar`. Replaces the old six-bar stub. Prop-compatible with `{ className?: string }` — `weeks` and `label` are optional.

## When to use

- `ScheduleCalendar` `loading` prop
- `BalanseQuickBooking` / `BalanseBookingCalendar` loading states

## Shape props

`className`, optional `weeks` (default 5), optional `label` (default `"Loading schedule"`). Callers that omit `label` stay valid.

## Accessibility

One `role="status"` region. Day cells are decorative (`aria-hidden`). Do not nest `Spinner`.
