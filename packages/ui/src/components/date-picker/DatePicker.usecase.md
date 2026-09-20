# DatePicker — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

String-valued date and date-range controls for admin session forms and report / customer filters. The public contract is `YYYY-MM-DD` (or `{ from, to }`), never a `Date`.

## When to use

- Single session or filter date (`DatePicker`)
- Inclusive report / customer range with Today / This week / This month presets (`DateRangePicker`)
- Any surface that already speaks `manilaYmd` strings

## When NOT to use

- Public / customer class grid → `ScheduleCalendar`
- Admin month grid on `/schedule` → `FullscreenCalendar` (`FE-ADM-030`)
- Time of day alone → `TimePicker`
- Timezone selection — Asia/Manila is fixed

## Examples

### Controlled single date

```tsx
<DatePicker
  value={sessionDate}
  onValueChange={setSessionDate}
  today="2026-09-16"
/>
```

### Range with presets

```tsx
<DateRangePicker
  value={range}
  onValueChange={setRange}
  today="2026-09-16"
/>
```

### Typed entry

Focus the input and type `2026-09-16` (or `2026-09-01 to 2026-09-16` for a range). The calendar panel does not open. Partial strings are not emitted to `onValueChange`.

## Gotchas

- **DayPicker boundary is browser-local, not Manila UTC.** Inbound `YYYY-MM-DD` becomes `new Date(year, month - 1, day)`. Outbound reads `getFullYear()` / `getMonth()` / `getDate()` and pads. Never `new Date(ymd)` and never `toISOString().slice(0, 10)`.
- `manilaYmdToUtcDate()` is for instant math and **display** (`formatSessionDate(manilaYmdToUtcDate(ymd))`). It is the wrong helper for the DayPicker `Date` — using it there reintroduces the off-by-one that `SchedulePages` already works around.
- Range panel is two months at `≥ 768px` (`BALANSE_BREAKPOINTS.tablet`) and one month below. Presets use `manilaYmd`, `startOfManilaWeekMonday`, `startOfManilaMonth`, `addManilaDays`, and `daysInManilaMonth` — no inline date arithmetic.
- `invalid`, `disabled`, and `readOnly` set `aria-invalid` / disable the trigger. Pair with `Field` + `aria-describedby` pointing at `FieldError`. There is no `useFieldContext()` yet (`FE-SHR-008`).
- Do not pass `size` on the composed `Input` / `Button` — inherit defaults so `FE-SHR-008` size aliasing is a no-op.
