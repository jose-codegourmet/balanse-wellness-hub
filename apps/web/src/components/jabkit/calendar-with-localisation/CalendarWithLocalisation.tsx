"use client";

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/jabkit/button";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  CalendarWithLocalisationCopy,
  CalendarWithLocalisationLocale,
  CalendarWithLocalisationLocaleOption,
  CalendarWithLocalisationProps,
  CalendarWithLocalisationRange,
} from "./CalendarWithLocalisation.types";

const DEFAULT_COPY: Record<
  CalendarWithLocalisationLocale,
  CalendarWithLocalisationCopy
> = {
  en: {
    title: "Book an appointment",
    description: "Select the dates for your appointment",
    languageLabel: "Language",
    previousMonth: "Previous month",
    nextMonth: "Next month",
  },
  es: {
    title: "Reserva una cita",
    description: "Selecciona las fechas para tu cita",
    languageLabel: "Idioma",
    previousMonth: "Mes anterior",
    nextMonth: "Mes siguiente",
  },
};

const DEFAULT_LOCALE_OPTIONS: CalendarWithLocalisationLocaleOption[] = [
  { value: "es", label: "Español", bcp47: "es-ES" },
  { value: "en", label: "English", bcp47: "en-US" },
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function dayKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function compareDays(a: Date, b: Date) {
  return dayKey(a).localeCompare(dayKey(b));
}

function weekStartsOn(bcp47: string) {
  try {
    const locale = new Intl.Locale(bcp47) as Intl.Locale & {
      weekInfo?: { firstDay: number };
    };
    const firstDay = locale.weekInfo?.firstDay;
    if (firstDay === 7) return 0;
    if (firstDay) return firstDay;
  } catch {
    // Intl.Locale.weekInfo is not available in every runtime.
  }
  return bcp47.startsWith("en") ? 0 : 1;
}

function weekdayLabels(bcp47: string, start: number) {
  const formatter = new Intl.DateTimeFormat(bcp47, { weekday: "short" });
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(2024, 0, 7 + start + index);
    return formatter.format(day).replace(/\.$/, "").slice(0, 2);
  });
}

function monthTitle(date: Date, bcp47: string) {
  return new Intl.DateTimeFormat(bcp47, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function monthCells(month: Date, startWeekday: number) {
  const first = startOfMonth(month);
  const offset = (first.getDay() - startWeekday + 7) % 7;
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cells: Array<{ key: string; date?: Date }> = [];
  for (let i = 0; i < offset; i++) {
    cells.push({ key: `pad-${dayKey(first)}-${i}` });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    cells.push({ key: dayKey(date), date });
  }
  return cells;
}

function isInRange(
  day: Date,
  range: CalendarWithLocalisationRange | undefined,
) {
  if (!range?.from || !range.to) return false;
  const start = compareDays(range.from, range.to) <= 0 ? range.from : range.to;
  const end = compareDays(range.from, range.to) <= 0 ? range.to : range.from;
  return compareDays(day, start) > 0 && compareDays(day, end) < 0;
}

function nextRange(
  current: CalendarWithLocalisationRange | undefined,
  day: Date,
): CalendarWithLocalisationRange {
  if (!current?.from || current.to) {
    return { from: day };
  }
  if (compareDays(day, current.from) < 0) {
    return { from: day, to: current.from };
  }
  return { from: current.from, to: day };
}

export function CalendarWithLocalisation({
  className,
  defaultLocale = "es",
  locale: localeProp,
  onLocaleChange,
  defaultMonth,
  numberOfMonths = 2,
  defaultSelected,
  selected: selectedProp,
  onSelect,
  copy,
  localeOptions = DEFAULT_LOCALE_OPTIONS,
  ...props
}: CalendarWithLocalisationProps) {
  const headingId = React.useId();
  const descriptionId = React.useId();
  const [uncontrolledLocale, setUncontrolledLocale] =
    React.useState<CalendarWithLocalisationLocale>(defaultLocale);
  const locale = localeProp ?? uncontrolledLocale;
  const option =
    localeOptions.find((item) => item.value === locale) ?? localeOptions[0];
  const bcp47 = option?.bcp47 ?? "es-ES";
  const strings = { ...DEFAULT_COPY[locale], ...copy?.[locale] };
  const startWeekday = weekStartsOn(bcp47);
  const weekdays = weekdayLabels(bcp47, startWeekday);

  const [viewMonth, setViewMonth] = React.useState(() =>
    startOfMonth(defaultMonth ?? defaultSelected?.from ?? new Date()),
  );
  const [uncontrolledSelected, setUncontrolledSelected] = React.useState<
    CalendarWithLocalisationRange | undefined
  >(() =>
    defaultSelected
      ? {
          from: startOfDay(defaultSelected.from),
          to: defaultSelected.to ? startOfDay(defaultSelected.to) : undefined,
        }
      : undefined,
  );
  const selected = selectedProp
    ? {
        from: startOfDay(selectedProp.from),
        to: selectedProp.to ? startOfDay(selectedProp.to) : undefined,
      }
    : uncontrolledSelected;

  const months = Array.from({ length: Math.max(1, numberOfMonths) }, (_, i) =>
    addMonths(viewMonth, i),
  );

  const setLocaleValue = (next: CalendarWithLocalisationLocale) => {
    if (localeProp === undefined) setUncontrolledLocale(next);
    onLocaleChange?.(next);
  };

  const pickDay = (day: Date) => {
    const next = nextRange(selected, startOfDay(day));
    if (selectedProp === undefined) setUncontrolledSelected(next);
    onSelect?.(next);
  };

  return (
    <section
      data-slot="calendar-with-localisation"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className={cn(
        "w-full max-w-[36rem] overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      <header className="relative flex flex-col gap-1 border-b border-border px-5 py-4 pr-32">
        <h2 id={headingId} className="text-base font-semibold tracking-tight">
          {strings.title}
        </h2>
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {strings.description}
        </p>
        <label className="absolute top-4 right-4 flex w-[6.5rem] flex-col gap-1 text-[11px] font-medium text-muted-foreground">
          <span className="sr-only">{strings.languageLabel}</span>
          <span className="relative">
            <select
              aria-label={strings.languageLabel}
              value={locale}
              onChange={(event) =>
                setLocaleValue(
                  event.target.value as CalendarWithLocalisationLocale,
                )
              }
              className="h-9 w-full appearance-none rounded-[--radius] border border-input bg-background pr-8 pl-2.5 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {localeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-muted-foreground" />
          </span>
        </label>
      </header>

      <div className="grid gap-2 p-4 sm:grid-cols-2">
        {months.map((month, index) => (
          <MonthGrid
            key={dayKey(month)}
            month={month}
            bcp47={bcp47}
            weekdays={weekdays}
            startWeekday={startWeekday}
            selected={selected}
            previousLabel={strings.previousMonth}
            nextLabel={strings.nextMonth}
            showPrevious={index === 0}
            showNext={index === months.length - 1}
            onPrevious={() => setViewMonth(addMonths(viewMonth, -1))}
            onNext={() => setViewMonth(addMonths(viewMonth, 1))}
            onPick={pickDay}
          />
        ))}
      </div>
    </section>
  );
}

function MonthGrid({
  month,
  bcp47,
  weekdays,
  startWeekday,
  selected,
  previousLabel,
  nextLabel,
  showPrevious,
  showNext,
  onPrevious,
  onNext,
  onPick,
}: {
  month: Date;
  bcp47: string;
  weekdays: string[];
  startWeekday: number;
  selected: CalendarWithLocalisationRange | undefined;
  previousLabel: string;
  nextLabel: string;
  showPrevious: boolean;
  showNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPick: (day: Date) => void;
}) {
  const cells = monthCells(month, startWeekday);
  const rangeStart = selected?.from;
  const rangeEnd = selected?.to;
  const start =
    rangeStart && rangeEnd && compareDays(rangeStart, rangeEnd) > 0
      ? rangeEnd
      : rangeStart;
  const end =
    rangeStart && rangeEnd && compareDays(rangeStart, rangeEnd) > 0
      ? rangeStart
      : rangeEnd;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        {showPrevious ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            aria-label={previousLabel}
            onClick={onPrevious}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
        ) : (
          <span className="size-8" />
        )}
        <p className="text-sm font-medium capitalize">
          {monthTitle(month, bcp47)}
        </p>
        {showNext ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            aria-label={nextLabel}
            onClick={onNext}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        ) : (
          <span className="size-8" />
        )}
      </div>
      <div className="grid grid-cols-7 gap-0 text-center">
        {weekdays.map((label) => (
          <span
            key={`${bcp47}-${label}`}
            className="text-[10px] font-medium tracking-wide text-muted-foreground"
          >
            {label}
          </span>
        ))}
        {cells.map((cell) => {
          if (!cell.date) {
            return <span key={cell.key} />;
          }
          const day = cell.date;
          const isStart = start ? isSameDay(day, start) : false;
          const isEnd = end ? isSameDay(day, end) : false;
          const selectedDay = isStart || isEnd;
          const mid = isInRange(day, selected);
          const hasRange = Boolean(start && end && !isSameDay(start, end));
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onPick(day)}
              aria-pressed={selectedDay || mid}
              aria-label={day.toLocaleDateString(bcp47, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              className={cn(
                "h-8 w-8 rounded-none text-xs tabular-nums transition-colors focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isSameMonth(day, month)
                  ? "text-foreground"
                  : "text-muted-foreground",
                selectedDay && "bg-primary text-primary-foreground",
                selectedDay &&
                  (hasRange
                    ? isStart
                      ? "rounded-l-md"
                      : "rounded-r-md"
                    : "rounded-md"),
                mid && "bg-accent text-accent-foreground",
                !selectedDay && !mid && "hover:bg-accent",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
