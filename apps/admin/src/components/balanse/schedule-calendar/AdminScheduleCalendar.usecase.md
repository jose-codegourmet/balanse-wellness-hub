# AdminScheduleCalendar — Use Cases

> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

## Purpose

Admin schedule surface with automatic month / week / day views. Month reuses vendored Jabkit `FullscreenCalendar`. Week and day are owned here so the Jabkit file stays pristine.

## When to use

- `/schedule` list page
- Storybook pins for each view and empty / dense states

## When NOT to use

- Public calendar — use `@balanse/ui` `ScheduleCalendar`
- Do not edit `src/components/jabkit/fullscreen-calendar/`

## Examples

```tsx
<AdminScheduleCalendar
  sessions={sessions}
  todayYmd={adminTodayYmd()}
  selectedDay={selectedDay}
  view="auto"
  onViewChange={setView}
  onSelectDay={setSelectedDay}
  onSelectSession={setSelectedId}
  onCreateSession={(ymd) => router.push(createSessionHref(ymd))}
/>
```

## Gotchas

- `view="auto"` uses the same thresholds as public `detectView`: desktop month, tablet week, mobile day
- Persist an explicit view with `?view=` (`auto` when the param is absent)
- All date math goes through Manila helpers. “Today” is `adminTodayYmd()` / `adminNowIso()`, never `Date.now()`
- Month grid still starts Sunday because that is what the vendored calendar draws. Week view is Monday–Sunday per `startOfManilaWeekMonday`
