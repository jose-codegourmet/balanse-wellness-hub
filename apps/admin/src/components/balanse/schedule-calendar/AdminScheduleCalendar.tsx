"use client";

import { BALANSE_BREAKPOINTS } from "@balanse/config";
import {
  type AdminSession,
  addManilaDays,
  formatSessionDate,
  formatSessionTime,
  manilaYmd,
  sessionDisplayName,
  startOfManilaMonth,
  startOfManilaWeekMonday,
} from "@balanse/domain";
import {
  Button,
  ButtonGroup,
  CalendarSkeleton,
  cn,
  ToggleGroup,
  ToggleGroupItem,
  useBreakpoint,
} from "@balanse/ui";
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon } from "lucide-react";
import { createContext, useContext, useMemo } from "react";
import type { AdminCalendarView, AdminScheduleCalendarProps } from "./AdminScheduleCalendar.meta";

export type {
  AdminCalendarView,
  AdminScheduleCalendarProps,
  AdminScheduleCalendarView,
} from "./AdminScheduleCalendar.meta";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_CHIP_LIMIT = 3;

export function detectAdminCalendarView(width: number): AdminCalendarView {
  if (width >= BALANSE_BREAKPOINTS.desktop) return "month";
  if (width >= BALANSE_BREAKPOINTS.tablet) return "week";
  return "day";
}

function sessionsOnDay(sessions: readonly AdminSession[], ymd: string): AdminSession[] {
  return sessions
    .filter((session) => manilaYmd(session.startsAt) === ymd)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

function labelFor(ymd: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "Asia/Manila" }).format(
    new Date(`${ymd}T04:00:00.000Z`),
  );
}

function titleFor(view: AdminCalendarView, anchor: string): string {
  if (view === "month") return labelFor(anchor, { month: "long", year: "numeric" });
  if (view === "week") {
    const start = startOfManilaWeekMonday(anchor);
    const end = addManilaDays(start, 6);
    const sameMonth = start.slice(0, 7) === end.slice(0, 7);
    return sameMonth
      ? `${labelFor(start, { month: "long", day: "numeric" })} – ${labelFor(end, { day: "numeric", year: "numeric" })}`
      : `${labelFor(start, { month: "short", day: "numeric" })} – ${labelFor(end, { month: "short", day: "numeric", year: "numeric" })}`;
  }
  return labelFor(anchor, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function shiftAnchor(view: AdminCalendarView, anchor: string, direction: 1 | -1): string {
  if (view === "day") return addManilaDays(anchor, direction);
  if (view === "week") return addManilaDays(anchor, 7 * direction);
  const [year, month] = startOfManilaMonth(anchor).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + direction, 1)).toISOString().slice(0, 10);
}

/** Avoids threading the optional venue label through every calendar view. */
const VenueLabelContext = createContext<AdminScheduleCalendarProps["venueLabel"]>(undefined);

export function AdminScheduleCalendar({
  sessions,
  todayYmd,
  anchorDay,
  selectedDay = null,
  selectedSessionId = null,
  view = "auto",
  onViewChange,
  onNavigate,
  onOpenDay,
  onOpenSession,
  venueLabel,
  actions,
  loading = false,
  className,
}: AdminScheduleCalendarProps) {
  const breakpoint = useBreakpoint();
  const resolvedView: AdminCalendarView =
    view === "auto" ? detectAdminCalendarView(BALANSE_BREAKPOINTS[breakpoint]) : view;

  if (loading) {
    return <CalendarSkeleton view={resolvedView} label="Loading schedule" className={className} />;
  }

  const shared = { sessions, todayYmd, selectedDay, selectedSessionId, onOpenDay, onOpenSession };
  const title = titleFor(resolvedView, anchorDay);

  return (
    <VenueLabelContext.Provider value={venueLabel}>
      <section
        className={cn("flex min-h-0 flex-col bg-card", className)}
        data-slot="admin-schedule-calendar"
        data-calendar-grid={resolvedView}
        aria-label="Schedule calendar"
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="font-display text-2xl leading-tight md:text-3xl">{title}</h1>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onNavigate(todayYmd)}
              >
                Today
              </Button>
              <ButtonGroup aria-label={`Change ${resolvedView}`}>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Previous ${resolvedView}`}
                  onClick={() => onNavigate(shiftAnchor(resolvedView, anchorDay, -1))}
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Next ${resolvedView}`}
                  onClick={() => onNavigate(shiftAnchor(resolvedView, anchorDay, 1))}
                >
                  <ChevronRightIcon />
                </Button>
              </ButtonGroup>
            </div>
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
            {actions}
          </div>
          <p className="sr-only" aria-live="polite">
            {resolvedView} view, {title}.
          </p>
        </header>

        {resolvedView === "month" ? <MonthView anchorDay={anchorDay} {...shared} /> : null}
        {resolvedView === "week" ? <WeekView anchorDay={anchorDay} {...shared} /> : null}
        {resolvedView === "day" ? <DayView ymd={anchorDay} {...shared} /> : null}
      </section>
    </VenueLabelContext.Provider>
  );
}

type ViewProps = {
  sessions: AdminSession[];
  todayYmd: string;
  selectedDay: string | null;
  selectedSessionId: string | null;
  onOpenDay: (ymd: string) => void;
  onOpenSession: (session: AdminSession) => void;
};

function MonthView({ anchorDay, ...props }: ViewProps & { anchorDay: string }) {
  const monthStart = startOfManilaMonth(anchorDay);
  const monthKey = monthStart.slice(0, 7);
  const days = useMemo(() => {
    const gridStart = startOfManilaWeekMonday(monthStart);
    const cells: string[] = [];
    for (let week = 0; week < 6; week += 1) {
      const weekStart = addManilaDays(gridStart, week * 7);
      if (week > 0 && weekStart.slice(0, 7) !== monthKey) break;
      for (let day = 0; day < 7; day += 1) cells.push(addManilaDays(weekStart, day));
    }
    return cells;
  }, [monthKey, monthStart]);
  const weeks = days.length / 7;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-7 border-b border-border" aria-hidden>
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="border-r border-border px-3 py-2 text-[0.625rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase last:border-r-0"
          >
            {label}
          </div>
        ))}
      </div>
      <div
        className="grid min-h-0 flex-1 grid-cols-7"
        style={{ gridTemplateRows: `repeat(${weeks}, minmax(6.5rem, 1fr))` }}
      >
        {days.map((ymd) => (
          <MonthCell key={ymd} ymd={ymd} inMonth={ymd.slice(0, 7) === monthKey} {...props} />
        ))}
      </div>
    </div>
  );
}

function MonthCell({
  ymd,
  inMonth,
  sessions,
  todayYmd,
  selectedDay,
  selectedSessionId,
  onOpenDay,
  onOpenSession,
}: ViewProps & { ymd: string; inMonth: boolean }) {
  const daySessions = sessionsOnDay(sessions, ymd);
  const visible = daySessions.slice(0, MONTH_CHIP_LIMIT);
  const extra = daySessions.length - visible.length;
  const isToday = ymd === todayYmd;
  const isSelected = ymd === selectedDay;
  const dayLabel = labelFor(ymd, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-col gap-1 overflow-hidden border-r border-b border-border p-1.5 transition-colors [&:nth-child(7n)]:border-r-0",
        inMonth ? "bg-card hover:bg-muted/40" : "bg-muted/35 text-muted-foreground",
        isSelected && "bg-secondary/60 hover:bg-secondary/60",
      )}
    >
      {/* The whole box opens the day. Session chips sit above it and open a session. */}
      <button
        type="button"
        aria-label={`${dayLabel}, ${daySessions.length} ${daySessions.length === 1 ? "session" : "sessions"}`}
        aria-pressed={isSelected}
        aria-current={isToday ? "date" : undefined}
        onClick={() => onOpenDay(ymd)}
        className="absolute inset-0 z-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
      />
      {isSelected ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 ring-2 ring-primary ring-inset"
        />
      ) : null}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none relative z-10 grid h-6 min-w-6 place-items-center self-start rounded-sm px-1 text-xs font-semibold tabular-nums",
          isToday && "bg-primary text-primary-foreground",
        )}
      >
        {Number(ymd.slice(8))}
      </span>
      <ul className="pointer-events-none relative z-10 grid min-h-0 gap-1">
        {visible.map((session) => (
          <li key={session.id}>
            <MonthSessionChip
              session={session}
              selected={session.id === selectedSessionId}
              onOpen={() => onOpenSession(session)}
            />
          </li>
        ))}
      </ul>
      {extra > 0 ? (
        <button
          type="button"
          onClick={() => onOpenDay(ymd)}
          className="relative z-10 self-start rounded-sm px-1 text-[0.6875rem] font-semibold text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          +{extra} more
        </button>
      ) : null}
    </div>
  );
}

function MonthSessionChip({
  session,
  selected,
  onOpen,
}: {
  session: AdminSession;
  selected: boolean;
  onOpen: () => void;
}) {
  const venue = useContext(VenueLabelContext)?.(session) ?? null;
  const cancelled = session.status === "CANCELLED";
  const draft = session.status === "DRAFT";
  return (
    <button
      type="button"
      onClick={onOpen}
      title={`${sessionDisplayName(session)} · ${formatSessionTime(session.startsAt)}${venue ? ` · ${venue}` : ""}`}
      className={cn(
        "pointer-events-auto flex w-full min-w-0 items-center gap-1.5 rounded-sm border-l-2 px-1.5 py-1 text-left text-[0.6875rem] leading-tight transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        selected
          ? "border-l-primary bg-primary text-primary-foreground"
          : "border-l-primary bg-background/80 hover:bg-background",
        draft && !selected && "border-dashed border-l-muted-foreground/50",
        cancelled && !selected && "border-l-destructive/60 text-muted-foreground line-through",
      )}
    >
      <span className="shrink-0 tabular-nums opacity-80">
        {formatSessionTime(session.startsAt)}
      </span>
      <span className="min-w-0 truncate font-semibold">{sessionDisplayName(session)}</span>
      {venue ? <MapPinIcon aria-label={venue} className="ml-auto size-3 shrink-0" /> : null}
    </button>
  );
}

function WeekView({ anchorDay, ...props }: ViewProps & { anchorDay: string }) {
  const start = startOfManilaWeekMonday(anchorDay);
  const days = [0, 1, 2, 3, 4, 5, 6].map((offset) => addManilaDays(start, offset));
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto sm:grid-cols-7 sm:overflow-hidden">
      {days.map((ymd, index) => {
        const daySessions = sessionsOnDay(props.sessions, ymd);
        const isToday = ymd === props.todayYmd;
        const isSelected = ymd === props.selectedDay;
        return (
          <div
            key={ymd}
            className={cn(
              "flex min-h-40 flex-col border-b border-border sm:min-h-0 sm:border-r sm:border-b-0 sm:last:border-r-0",
              isSelected && "bg-secondary/50",
            )}
          >
            <button
              type="button"
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              onClick={() => props.onOpenDay(ymd)}
              className="flex items-baseline gap-2 border-b border-border px-3 py-2.5 text-left hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
            >
              <span className="text-[0.625rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {WEEKDAY_LABELS[index]}
              </span>
              <span
                className={cn(
                  "grid h-6 min-w-6 place-items-center rounded-sm px-1 text-sm font-semibold tabular-nums",
                  isToday && "bg-primary text-primary-foreground",
                )}
              >
                {Number(ymd.slice(8))}
              </span>
            </button>
            <ul className="grid content-start gap-1.5 overflow-y-auto p-2">
              {daySessions.map((session) => (
                <li key={session.id}>
                  <SessionCard
                    session={session}
                    selected={session.id === props.selectedSessionId}
                    onOpen={() => props.onOpenSession(session)}
                  />
                </li>
              ))}
              {daySessions.length === 0 ? (
                <li>
                  <button
                    type="button"
                    onClick={() => props.onOpenDay(ymd)}
                    className="w-full rounded-md border border-dashed border-border px-2 py-3 text-xs text-muted-foreground hover:border-foreground/40"
                  >
                    Nothing scheduled
                  </button>
                </li>
              ) : null}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function DayView({ ymd, ...props }: ViewProps & { ymd: string }) {
  const daySessions = sessionsOnDay(props.sessions, ymd);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
      {daySessions.length === 0 ? (
        <button
          type="button"
          onClick={() => props.onOpenDay(ymd)}
          className="grid min-h-40 w-full place-items-center rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground hover:border-foreground/40"
        >
          Nothing scheduled on {formatSessionDate(`${ymd}T04:00:00.000Z`)}.
        </button>
      ) : (
        <ul className="mx-auto grid max-w-3xl gap-2" aria-label="Sessions on this day">
          {daySessions.map((session) => (
            <li key={session.id}>
              <SessionCard
                session={session}
                selected={session.id === props.selectedSessionId}
                roomy
                onOpen={() => props.onOpenSession(session)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SessionCard({
  session,
  selected,
  roomy = false,
  onOpen,
}: {
  session: AdminSession;
  selected: boolean;
  roomy?: boolean;
  onOpen: () => void;
}) {
  const venue = useContext(VenueLabelContext)?.(session) ?? null;
  const booked = session.capacity - session.remainingSlots;
  const fill = session.capacity > 0 ? Math.min(100, (booked / session.capacity) * 100) : 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-pressed={selected}
      className={cn(
        "grid w-full gap-1 rounded-md border border-l-2 border-l-primary bg-background text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        roomy ? "px-4 py-3" : "px-2.5 py-2",
        selected
          ? "border-primary ring-1 ring-primary"
          : "border-border hover:border-foreground/40",
        session.status === "DRAFT" && "border-dashed border-l-muted-foreground/50",
        session.status === "CANCELLED" && "border-l-destructive/60 opacity-70",
      )}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span
          className={cn(
            "min-w-0 truncate font-semibold",
            roomy ? "text-base" : "text-xs",
            session.status === "CANCELLED" && "line-through",
          )}
        >
          {sessionDisplayName(session)}
        </span>
        <span className="shrink-0 text-[0.6875rem] text-muted-foreground tabular-nums">
          {formatSessionTime(session.startsAt)}
        </span>
      </span>
      <span className="truncate text-[0.6875rem] text-muted-foreground">{session.coachName}</span>
      {venue ? (
        <span className="flex min-w-0 items-center gap-1 text-[0.6875rem] font-medium text-primary">
          <MapPinIcon aria-hidden className="size-3 shrink-0" />
          <span className="truncate">{venue}</span>
        </span>
      ) : null}
      <span className="mt-0.5 flex items-center gap-2">
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <span className="block h-full bg-primary" style={{ width: `${fill}%` }} />
        </span>
        <span className="text-[0.625rem] text-muted-foreground tabular-nums">
          {booked}/{session.capacity}
        </span>
      </span>
    </button>
  );
}
