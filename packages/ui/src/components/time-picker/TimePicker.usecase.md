# TimePicker — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

24-hour `HH:mm` time control for session start and end. Typed entry plus a stepped list. The public contract is a clock string, never a `Date`.

## When to use

- Session start / end on create-edit forms
- Any filter that stores a wall-clock time in Manila

## When NOT to use

- Date or date range → `DatePicker` / `DateRangePicker`
- Instant timestamps for display → `formatSessionTime` on an ISO value
- Timezone picker — Asia/Manila is fixed

## Examples

### Start and exclusive end

```tsx
<TimePicker value={start} onValueChange={setStart} />
<TimePicker value={end} onValueChange={setEnd} after={start} />
```

`after` is **exclusive**: the end time must be strictly later than the start. Options at or before `after` are disabled, and a typed value at or before `after` is rejected (not emitted).

### Stepped list

```tsx
<TimePicker step={15} defaultValue="08:00" />
```

## Gotchas

- When `after` moves to a value greater than or equal to the current value, the control surfaces `aria-invalid` and **does not** silently rewrite the value. The form owner decides whether to clear or correct it.
- Option labels go through `formatSessionTime` with a fixed Manila offset (`2026-09-16T${HH:mm}:00+08:00`). That composition is display-only; the stored value stays `HH:mm`. Do not call `toLocaleTimeString`.
- Partial typed input never reaches `onValueChange`. On blur, an unparseable draft reverts to the last valid value.
- Pair `invalid` / `disabled` / `readOnly` with `Field` and `aria-describedby` → `FieldError`.
- Enter / Space on the **clock icon** opens the list. Enter in the text field commits a typed `HH:mm` and does not open the list.
