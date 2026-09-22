"use client";

import { BALANSE_BREAKPOINTS } from "@balanse/config";
import {
  type AdminSession,
  addManilaDays,
  formatSessionDate,
  formatSessionTime,
  localDateFromYmd,
  manilaYmd,
  sessionDisplayName,
  startOfManilaMonth,
  startOfManilaWeekMonday,
  ymdFromLocalDate,
} from "@balanse/domain";
import {
  Button,
  CalendarSkeleton,
  cn,
  ToggleGroup,
  ToggleGroupItem,
  useBreakpoint,
} from "@balanse/ui";
import { useMemo } from "react";
import { FullscreenCalendar } from "@/components/jabkit/fullscreen-calendar";
import type { FullscreenCalendarDay } from "@/components/jabkit/fullscreen-calendar/FullscreenCalendar.types";
import type { AdminCalendarView, AdminScheduleCalendarProps } from "./AdminScheduleCalendar.meta";

export type {
  AdminCalendarView,
  AdminScheduleCalendarProps,
  AdminScheduleCalendarView,
} from "./AdminScheduleCalendar.meta";

export function detectAdminCalendarView(width: number): AdminCalendarView {
  if (width >= BALANSE_BREAKPOINTS.desktop) return "month";
  if (width >= BALANSE_BREAKPOINTS.tablet) return "week";
  return "day";
}

function sessionsOnDay(sessions: AdminSession[], ymd: string): AdminSession[] {
  return sessions
    .filter((session) => manilaYmd(session.startsAt) === ymd)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

function monthLabel(ymd: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(`${ymd}T04:00:00.000Z`));
}

function weekRangeLabel(ymd: string): string {
  const start = startOfManilaWeekMonday(ymd);
  const end = addManilaDays(start, 6);
  return `${formatSessionDate(`${start}T04:00:00.000Z`)} – ${formatSessionDate(`${end}T04:00:00.000Z`)}`;
}

export function AdminScheduleCalendar({
  sessions,
  todayYmd,
  selectedDay,
  selectedSessionId = null,
  view = "auto",
  onViewChange,
  onSelectDay,
  onSelectSession,
  onCreateSession,
  loading = false,
  className,
}: AdminScheduleCalendarProps) {
  const breakpoint = useBreakpoint();
  const resolvedView: AdminCalendarView =
    view === "auto" ? detectAdminCalendarView(BALANSE_BREAKPOINTS[breakpoint]) : view;

  const monthData = useMemo<FullscreenCalendarDay[]>(() => {
    const byDay = new Map<string, FullscreenCalendarDay["events"]>();
    for (const session of sessions) {
      const ymd = manilaYmd(session.startsAt);
      const events = byDay.get(ymd) ?? [];
      events.push({
        id: session.id,
        name: sessionDisplayName(session),
        time: formatSessionTime(session.startsAt),
      });
      byDay.set(ymd, events);
    }
    return [...byDay.entries()].map(([ymd, events]) => ({
      day: localDateFromYmd(ymd),
      events,
    }));
  }, [sessions]);

  const weekDays = useMemo(() => {
    const start = startOfManilaWeekMonday(selectedDay);
    return [0, 1, 2, 3, 4, 5, 6].map((offset) => addManilaDays(start, offset));
  }, [selectedDay]);

  if (loading) {
    return <CalendarSkeleton view={resolvedView} label="Loading schedule" className={className} />;
  }

  return (
    <section
      className={cn("min-h-0 bg-background", className)}
      data-slot="admin-schedule-calendar"
      data-calendar-grid={resolvedView}
      aria-label="Admin schedule calendar"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="font-display text-xl">
            {resolvedView === "month"
              ? monthLabel(selectedDay)
              : resolvedView === "week"
                ? weekRangeLabel(selectedDay)
                : formatSessionDate(`${selectedDay}T04:00:00.000Z`)}
          </p>
          <p className="sr-only" aria-live="polite">
            {resolvedView} view. {selectedDay} selected.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            variant="outline"
            size="sm"
            value={[resolvedView]}
            onValueChange={(next) => {
              const picked = Array.isArray(next) ? next[0] : next;
              if (picked === "day" || picked === "week" || picked === "month") {
                onViewChange?.(picked);
              }
            }}
            aria-label="Calendar view"
          >
            <ToggleGroupItem value="month">Month</ToggleGroupItem>
            <ToggleGroupItem value="week">Week</ToggleGroupItem>
            <ToggleGroupItem value="day">Day</ToggleGroupItem>
          </ToggleGroup>
          {resolvedView === "month" ? null : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onSelectDay(addManilaDays(selectedDay, resolvedView === "week" ? -7 : -1))
                }
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSelectDay(todayYmd)}
              >
                Today
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onSelectDay(addManilaDays(selectedDay, resolvedView === "week" ? 7 : 1))
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {resolvedView === "month" ? (
        <FullscreenCalendar
          key={`${startOfManilaMonth(selectedDay)}-${selectedDay}`}
          className="min-h-0"
          data={monthData}
          today={localDateFromYmd(todayYmd)}
          defaultMonth={localDateFromYmd(startOfManilaMonth(selectedDay))}
          defaultSelectedDay={localDateFromYmd(selectedDay)}
          addEventLabel={onCreateSession ? "Create Session" : undefined}
          onMonthChange={(month) => onSelectDay(startOfManilaMonth(ymdFromLocalDate(month)))}
          onSelectDay={(day) => {
            const ymd = ymdFromLocalDate(day);
            onSelectDay(ymd);
            const match = sessionsOnDay(sessions, ymd)[0];
            onSelectSession(match?.id ?? null);
          }}
          onAddEvent={onCreateSession ? (day) => onCreateSession(ymdFromLocalDate(day)) : undefined}
        />
      ) : null}

      {resolvedView === "week" ? (
        <WeekView
          days={weekDays}
          sessions={sessions}
          todayYmd={todayYmd}
          selectedDay={selectedDay}
          selectedSessionId={selectedSessionId}
          onSelectDay={onSelectDay}
          onSelectSession={onSelectSession}
          onCreateSession={onCreateSession}
        />
      ) : null}

      {resolvedView === "day" ? (
        <DayView
          ymd={selectedDay}
          sessions={sessionsOnDay(sessions, selectedDay)}
          todayYmd={todayYmd}
          selectedSessionId={selectedSessionId}
          onSelectDay={onSelectDay}
          onSelectSession={onSelectSession}
          onCreateSession={onCreateSession}
        />
      ) : null}
    </section>
  );
}

function WeekView({
  days,
  sessions,
  todayYmd,
  selectedDay,
  selectedSessionId,
  onSelectDay,
  onSelectSession,
}: {
  days: string[];
  sessions: AdminSession[];
  todayYmd: string;
  selectedDay: string;
  selectedSessionId: string | null;
  onSelectDay: (ymd: string) => void;
  onSelectSession: (id: string | null) => void;
  onCreateSession?: (ymd: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-7">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, index) => {
        const ymd = days[index] ?? days[0];
        const daySessions = sessionsOnDay(sessions, ymd);
        const isToday = ymd === todayYmd;
        const isSelected = ymd === selectedDay;
        return (
          <div
            key={ymd}
            className={cn(
              "flex min-h-48 flex-col rounded-lg border p-2",
              isSelected ? "border-primary bg-secondary/40" : "border-border bg-card",
              isToday && "ring-1 ring-accent",
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-1">
              <button
                type="button"
                className="min-h-11 text-left text-sm font-medium"
                aria-current={isSelected ? "date" : undefined}
                onClick={() => {
                  onSelectDay(ymd);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    onSelectDay(addManilaDays(ymd, -1));
                  }
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    onSelectDay(addManilaDays(ymd, 1));
                  }
                }}
              >
                <span className="block text-[11px] tracking-wider text-muted-foreground uppercase">
                  {label}
                </span>
                <span>{ymd.slice(8)}</span>
              </button>
            </div>
            <ul className="grid gap-1.5">
              {daySessions.map((session) => (
                <li key={session.id}>
                  <SessionChip
                    session={session}
                    selected={session.id === selectedSessionId}
                    dense
                    onSelect={() => {
                      onSelectDay(ymd);
                      onSelectSession(session.id);
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function DayView({
  ymd,
  sessions,
  todayYmd,
  selectedSessionId,
  onSelectDay,
  onSelectSession,
  onCreateSession,
}: {
  ymd: string;
  sessions: AdminSession[];
  todayYmd: string;
  selectedSessionId: string | null;
  onSelectDay: (ymd: string) => void;
  onSelectSession: (id: string | null) => void;
  onCreateSession?: (ymd: string) => void;
}) {
  return (
    <div className="grid gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Jump to date
          </span>
          <input
            type="date"
            value={ymd}
            className="h-11 rounded-lg border border-border bg-background px-3"
            onChange={(event) => {
              if (event.target.value) onSelectDay(event.target.value);
            }}
          />
        </label>
        {onCreateSession ? (
          <Button type="button" onClick={() => onCreateSession(ymd)}>
            Create Session
          </Button>
        ) : null}
      </div>
      {sessions.length === 0 ? (
        onCreateSession ? (
          <button
            type="button"
            className={cn(
              "min-h-24 rounded-xl border border-dashed border-border p-4 text-left text-sm text-muted-foreground",
              ymd === todayYmd && "ring-1 ring-accent",
            )}
            onClick={() => onCreateSession(ymd)}
          >
            Nothing scheduled on {formatSessionDate(`${ymd}T04:00:00.000Z`)}. Tap to create a
            session.
          </button>
        ) : (
          <p className="min-h-24 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Nothing scheduled on {formatSessionDate(`${ymd}T04:00:00.000Z`)}.
          </p>
        )
      ) : (
        <ul className="grid gap-2" aria-label="Sessions on selected day">
          {sessions.map((session) => (
            <li key={session.id}>
              <SessionChip
                session={session}
                selected={session.id === selectedSessionId}
                onSelect={() => onSelectSession(session.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SessionChip({
  session,
  selected,
  dense = false,
  onSelect,
}: {
  session: AdminSession;
  selected: boolean;
  dense?: boolean;
  onSelect: () => void;
}) {
  const booked = session.capacity - session.remainingSlots;
  return (
    <button
      type="button"
      className={cn(
        "flex w-full flex-col rounded-md border text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        dense ? "gap-0.5 px-2 py-2" : "min-h-11 gap-1 px-3 py-3",
        selected ? "border-primary bg-secondary" : "border-border bg-card",
      )}
      onClick={onSelect}
    >
      <span className="font-medium">{sessionDisplayName(session)}</span>
      <span className="text-xs text-muted-foreground">
        {formatSessionTime(session.startsAt)} · {session.coachName}
      </span>
      {dense ? null : (
        <span className="text-xs text-muted-foreground">
          {booked}/{session.capacity} booked
        </span>
      )}
    </button>
  );
}
