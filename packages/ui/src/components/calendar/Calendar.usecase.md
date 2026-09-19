# Calendar — Use Cases

> Part of the [Component Usage Guide](../../../../../docs/component-guide.md).

## Purpose

Date picker grid for single dates or ranges (`react-day-picker`).

## When to use

- Single date or date-range selection
- Embedding in Card or Popover content

## When NOT to use

- Time-of-day alone → use a time input instead
- Non-interactive date display → use plain text instead

## Examples

### Single date selection

Selection state comes from DayPicker's `selected` / `onSelect`.

```tsx
"use client";

import { useState } from "react";

import { Calendar } from "@balanse/ui";

const [date, setDate] = useState<Date | undefined>();

<Calendar mode="single" selected={date} onSelect={setDate} />;
```

### Two-month range picker

`mode="range"` with `numberOfMonths` for booking-style flows.

```tsx
<Calendar mode="range" numberOfMonths={2} />
```

## Gotchas

- `"use client"` required
- Heavily depends on the DayPicker API (`selected`, `onSelect`, `captionLayout`, `showOutsideDays`, …)
