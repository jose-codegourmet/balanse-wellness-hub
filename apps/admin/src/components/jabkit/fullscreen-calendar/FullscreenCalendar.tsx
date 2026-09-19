"use client";

import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/jabkit/button";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  FullscreenCalendarDay,
  FullscreenCalendarEvent,
  FullscreenCalendarProps,
} from "./FullscreenCalendar.types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const defaults = {
  todayLabel: "Today",
  addEventLabel: "Add event",
  weekdayLabels: WEEKDAYS,
} as const;

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

function calendarDays(month: Date) {
  const first = startOfMonth(month);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    days.push(day);
  }
  return days;
}

function monthFormatter(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function monthYearFormatter(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function rangeFormatter(month: Date) {
  const start = startOfMonth(month);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return `${start.toLocaleDateString("en-US", opts)} - ${end.toLocaleDateString("en-US", opts)}`;
}

function eventsForDay(data: FullscreenCalendarDay[], day: Date) {
  const match = data.find((entry) => isSameDay(entry.day, day));
  return match?.events ?? [];
}

export function FullscreenCalendar({
  className,
  data = [],
  today: todayProp,
  defaultMonth,
  defaultSelectedDay,
  todayLabel = defaults.todayLabel,
  addEventLabel = defaults.addEventLabel,
  weekdayLabels = defaults.weekdayLabels,
  onSelectDay,
  onMonthChange,
  onAddEvent,
  ...props
}: FullscreenCalendarProps) {
  const headingId = React.useId();
  const today = startOfDay(todayProp ?? new Date());
  const [month, setMonth] = React.useState(() =>
    startOfMonth(defaultMonth ?? today),
  );
  const [selectedDay, setSelectedDay] = React.useState(() =>
    startOfDay(defaultSelectedDay ?? today),
  );

  const days = React.useMemo(() => calendarDays(month), [month]);
  const currentMonthDays = days.filter((day) => isSameMonth(day, month));

  const goToMonth = (next: Date) => {
    const nextMonth = startOfMonth(next);
    setMonth(nextMonth);
    onMonthChange?.(nextMonth);
  };

  const selectDay = (day: Date) => {
    const next = startOfDay(day);
    setSelectedDay(next);
    if (!isSameMonth(next, month)) goToMonth(next);
    onSelectDay?.(next);
  };

  return (
    <section
      data-slot="fullscreen-calendar"
      aria-labelledby={headingId}
      className={cn(
        "flex min-h-[100dvh] flex-col bg-background text-foreground",
        className,
      )}
      {...props}
    >
      <header className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="hidden w-[4.5rem] flex-col overflow-hidden rounded-[--radius] border border-border md:flex">
            <p className="bg-muted px-1 py-1 text-center text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {monthFormatter(today)}
            </p>
            <p className="bg-background py-1.5 text-center text-lg font-semibold tabular-nums">
              {today.getDate()}
            </p>
          </div>
          <div>
            <h1
              id={headingId}
              className="text-lg font-semibold tracking-[-0.03em]"
            >
              {monthYearFormatter(month)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {rangeFormatter(month)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              goToMonth(today);
              selectDay(today);
            }}
          >
            {todayLabel}
          </Button>
          <div className="inline-flex overflow-hidden rounded-[--radius] border border-border">
            <button
              type="button"
              aria-label="Previous month"
              className="inline-flex size-9 items-center justify-center text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => goToMonth(addMonths(month, -1))}
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              className="inline-flex size-9 items-center justify-center border-l border-border text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => goToMonth(addMonths(month, 1))}
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={() => onAddEvent?.(selectedDay)}
          >
            <PlusIcon className="size-4" />
            {addEventLabel}
          </Button>
        </div>
      </header>

      <div
        className="hidden grid-cols-7 border-b border-border text-center text-xs font-medium text-muted-foreground md:grid"
        aria-hidden="true"
      >
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="border-r border-border py-2.5 last:border-r-0"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="hidden flex-1 md:grid md:grid-cols-7 md:grid-rows-6">
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const selected = isSameDay(day, selectedDay);
          const isToday = isSameDay(day, today);
          const events = eventsForDay(data, day);
          return (
            <DayCell
              key={day.toISOString()}
              day={day}
              weekday={weekdayLabels[day.getDay()] ?? WEEKDAYS[day.getDay()]}
              inMonth={inMonth}
              selected={selected}
              isToday={isToday}
              events={events}
              onSelect={() => selectDay(day)}
            />
          );
        })}
      </div>

      <ol className="flex flex-1 flex-col divide-y divide-border md:hidden">
        {currentMonthDays.map((day) => {
          const events = eventsForDay(data, day);
          const selected = isSameDay(day, selectedDay);
          const isToday = isSameDay(day, today);
          return (
            <li key={day.toISOString()}>
              <button
                type="button"
                onClick={() => selectDay(day)}
                aria-pressed={selected}
                aria-current={isToday ? "date" : undefined}
                className={cn(
                  "flex w-full items-start gap-4 px-4 py-3 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected && "bg-accent",
                )}
              >
                <span className="flex w-12 shrink-0 flex-col">
                  <span className="text-xs text-muted-foreground">
                    {weekdayLabels[day.getDay()] ?? WEEKDAYS[day.getDay()]}
                  </span>
                  <span
                    className={cn(
                      "mt-1 inline-flex size-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                      isToday && "bg-primary text-primary-foreground",
                    )}
                  >
                    {day.getDate()}
                  </span>
                </span>
                <span className="min-w-0 flex-1 space-y-1.5">
                  {events.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      No events
                    </span>
                  ) : (
                    events.map((event) => (
                      <EventChip key={event.id} event={event} />
                    ))
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DayCell({
  day,
  weekday,
  inMonth,
  selected,
  isToday,
  events,
  onSelect,
}: {
  day: Date;
  weekday: string;
  inMonth: boolean;
  selected: boolean;
  isToday: boolean;
  events: FullscreenCalendarEvent[];
  onSelect: () => void;
}) {
  const extra = events.length - 2;
  return (
    <div
      className={cn(
        "relative flex min-h-[7.5rem] flex-col border-r border-b border-border p-2 [&:nth-child(7n)]:border-r-0",
        !inMonth && "bg-muted/50 text-muted-foreground",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-current={isToday ? "date" : undefined}
        aria-label={`${weekday} ${day.getDate()}`}
        className={cn(
          "mb-2 inline-flex size-7 items-center justify-center self-end rounded-full text-xs font-medium tabular-nums hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isToday && "bg-primary text-primary-foreground hover:bg-primary",
          selected &&
            !isToday &&
            "bg-accent text-accent-foreground ring-2 ring-ring ring-offset-1 ring-offset-background",
        )}
      >
        {day.getDate()}
      </button>
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
        {events.slice(0, 2).map((event) => (
          <EventChip key={event.id} event={event} compact />
        ))}
        {extra > 0 ? (
          <p className="px-1 text-[11px] text-muted-foreground">
            +{extra} more
          </p>
        ) : null}
      </div>
    </div>
  );
}

function EventChip({
  event,
  compact = false,
}: {
  event: FullscreenCalendarEvent;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-[calc(var(--radius)-4px)] border border-border bg-muted/70 px-1.5 py-1 text-left",
        compact && "px-1.5 py-0.5",
      )}
    >
      <p className="truncate text-[11px] font-medium text-foreground">
        {event.name}
      </p>
      <p className="text-[10px] text-muted-foreground">{event.time}</p>
    </div>
  );
}
