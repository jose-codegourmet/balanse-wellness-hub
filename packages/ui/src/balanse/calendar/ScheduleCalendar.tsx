"use client";

import { BALANSE_BREAKPOINTS } from "@balanse/config";
import {
  addManilaDays,
  daysInManilaMonth,
  formatPeso,
  formatSessionDate,
  formatSessionTime,
  manilaYmd,
  type PublicClass,
  type PublicSession,
  startOfManilaMonth,
  startOfManilaWeekMonday,
} from "@balanse/domain";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/button/Button";
import { cn } from "../../lib/utils";
import { CalendarSkeleton, FeedbackState } from "../feedback/FeedbackState";

export type CalendarView = "day" | "week" | "month";
export type CalendarAudience = "guest" | "customer";

export type ScheduleCalendarProps = {
  sessions: PublicSession[];
  classes: PublicClass[];
  nowIso: string;
  view?: CalendarView | "auto";
  audience?: CalendarAudience;
  loading?: boolean;
  loadError?: boolean;
  sessionBecameFullId?: string | null;
  viewerBookingSessionIds?: string[];
  selectedSessionId?: string | null;
  onRetry?: () => void;
  onReserve?: (session: PublicSession) => void;
  onClearFilter?: () => void;
  initialClassFilter?: string;
};

const AVAILABILITY_COPY: Record<PublicSession["availability"], string> = {
  open: "Open",
  nearly_full: "Almost full",
  full_with_waitlist: "Full",
  past: "Past",
  cancelled: "Cancelled",
  past_cutoff: "Closed",
};

function detectView(width: number): CalendarView {
  if (width >= BALANSE_BREAKPOINTS.desktop) return "month";
  if (width >= BALANSE_BREAKPOINTS.tablet) return "week";
  return "day";
}

function remainingCopy(session: PublicSession): string {
  if (session.remainingSlots <= 0) return "No spots left";
  if (session.remainingSlots === 1) return "1 spot left";
  return `${session.remainingSlots} spots left`;
}

export function ScheduleCalendar({
  sessions,
  classes,
  nowIso,
  view = "auto",
  audience = "guest",
  loading = false,
  loadError = false,
  sessionBecameFullId = null,
  viewerBookingSessionIds = [],
  selectedSessionId = null,
  onRetry,
  onReserve,
  onClearFilter,
  initialClassFilter = "all",
}: ScheduleCalendarProps) {
  const [width, setWidth] = useState<number>(BALANSE_BREAKPOINTS.desktop);
  const [classFilter, setClassFilter] = useState<string>(initialClassFilter);
  const [selectedDay, setSelectedDay] = useState(() => manilaYmd(nowIso));
  const [selectedId, setSelectedId] = useState<string | null>(selectedSessionId);

  useEffect(() => {
    if (view !== "auto") return;
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [view]);

  const resolvedView: CalendarView = view === "auto" ? detectView(width) : view;
  const today = manilaYmd(nowIso);

  const filtered = useMemo(() => {
    if (classFilter === "all") return sessions;
    return sessions.filter((session) => session.classId === classFilter);
  }, [classFilter, sessions]);

  const days = useMemo(() => {
    const cells: Array<{ key: string; ymd: string | null }> = [];
    if (resolvedView === "day") return [{ key: selectedDay, ymd: selectedDay }];
    if (resolvedView === "week") {
      const start = startOfManilaWeekMonday(selectedDay);
      for (const offset of [0, 1, 2, 3, 4, 5, 6]) {
        const ymd = addManilaDays(start, offset);
        cells.push({ key: ymd, ymd });
      }
      return cells;
    }
    const monthStart = startOfManilaMonth(selectedDay);
    const count = daysInManilaMonth(monthStart);
    const leading = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        weekday: "short",
      }).format(new Date(`${monthStart}T04:00:00.000Z`)),
    );
    for (const pad of ["A", "B", "C", "D", "E", "F"].slice(0, Math.max(leading, 0))) {
      cells.push({ key: `pad-${monthStart}-${pad}`, ymd: null });
    }
    for (let day = 1; day <= count; day += 1) {
      const ymd = `${monthStart.slice(0, 7)}-${String(day).padStart(2, "0")}`;
      cells.push({ key: ymd, ymd });
    }
    return cells;
  }, [resolvedView, selectedDay]);

  const daySessions = filtered
    .filter((session) => manilaYmd(session.startsAt) === selectedDay)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const selected =
    daySessions.find((session) => session.id === selectedId) ?? daySessions[0] ?? null;
  const becameFull = selected && sessionBecameFullId === selected.id;

  const filterEmpty = classFilter !== "all" && filtered.length === 0;
  const dayEmpty = !filterEmpty && !loadError && daySessions.length === 0;

  function moveDay(delta: number) {
    setSelectedDay((current) => addManilaDays(current, delta));
    setSelectedId(null);
  }

  function announceDay(ymd: string) {
    const count = filtered.filter((session) => manilaYmd(session.startsAt) === ymd).length;
    const label = formatSessionDate(`${ymd}T04:00:00.000Z`);
    return `${label} selected. ${count} ${count === 1 ? "session" : "sessions"}.`;
  }

  if (loading) return <CalendarSkeleton />;
  if (loadError) {
    return <FeedbackState id="calendar.load-failed" onAction={onRetry} />;
  }

  return (
    <section className="space-y-4" aria-label="Class schedule calendar">
      <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Class filters">
        <Button
          type="button"
          size="sm"
          variant={classFilter === "all" ? "default" : "outline"}
          onClick={() => setClassFilter("all")}
        >
          All
        </Button>
        {classes.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={classFilter === item.id ? "default" : "outline"}
            onClick={() => setClassFilter(item.id)}
          >
            {item.name}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {announceDay(selectedDay)} {resolvedView} view.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => moveDay(-1)}>
            Previous day
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setSelectedDay(today)}>
            Today
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => moveDay(1)}>
            Next day
          </Button>
        </div>
      </div>

      {filterEmpty ? (
        <FeedbackState
          id="calendar.filter-empty"
          onAction={() => {
            setClassFilter("all");
            onClearFilter?.();
          }}
        />
      ) : (
        <div
          className={cn(
            "grid gap-2",
            resolvedView === "week" && "grid-cols-7",
            resolvedView === "month" && "grid-cols-7",
          )}
        >
          {resolvedView !== "day"
            ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                <div key={label} className="px-1 text-xs font-medium text-muted-foreground">
                  {label}
                </div>
              ))
            : null}
          {days.map((cell) => {
            const ymd = cell.ymd;
            if (!ymd) {
              return <div key={cell.key} className="min-h-16 rounded-md bg-muted/40" />;
            }
            const count = filtered.filter((session) => manilaYmd(session.startsAt) === ymd).length;
            const booked = filtered.some(
              (session) =>
                manilaYmd(session.startsAt) === ymd && viewerBookingSessionIds.includes(session.id),
            );
            return (
              <button
                key={ymd}
                type="button"
                aria-current={ymd === selectedDay ? "date" : undefined}
                aria-label={`${formatSessionDate(`${ymd}T04:00:00.000Z`)}${booked ? ", includes your booking" : ""}`}
                className={cn(
                  "min-h-16 rounded-md border px-2 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  ymd === selectedDay
                    ? "border-primary bg-secondary font-semibold"
                    : "border-border bg-card",
                  ymd === today && "ring-1 ring-accent",
                )}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    moveDay(-1);
                  }
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    moveDay(1);
                  }
                }}
                onClick={() => {
                  setSelectedDay(ymd);
                  setSelectedId(null);
                }}
              >
                <span className="block">{ymd.slice(8)}</span>
                <span className="block text-xs text-muted-foreground">
                  {count} {count === 1 ? "session" : "sessions"}
                  {booked ? " · yours" : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {dayEmpty ? <FeedbackState id="calendar.no-sessions" /> : null}

      {!filterEmpty && daySessions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-[1fr_20rem]">
          <ul className="space-y-2" aria-label="Sessions on selected day">
            {daySessions.map((session) => {
              const mine = viewerBookingSessionIds.includes(session.id);
              const closed = !session.reservable;
              return (
                <li key={session.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col gap-1 rounded-md border px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected?.id === session.id ? "border-primary bg-secondary" : "border-border",
                      closed && "opacity-80",
                    )}
                    onClick={() => setSelectedId(session.id)}
                  >
                    <span className="font-medium">{session.className}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatSessionTime(session.startsAt)} · {session.coachName}
                    </span>
                    <span className="text-xs uppercase tracking-wide">
                      {AVAILABILITY_COPY[session.availability]}
                      {mine ? " · Your booking" : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {selected ? (
            <aside
              className="rounded-xl border border-border bg-card p-4"
              aria-label="Selected session"
            >
              {becameFull ? (
                <FeedbackState
                  id="calendar.session-became-full"
                  onAction={() => onReserve?.(selected)}
                />
              ) : (
                <>
                  <h2 className="font-display text-xl">{selected.className}</h2>
                  <dl className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt>Time</dt>
                      <dd>
                        {formatSessionTime(selected.startsAt)}–{formatSessionTime(selected.endsAt)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Coach</dt>
                      <dd>{selected.coachName}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Price</dt>
                      <dd>{formatPeso(selected.pricePhp)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Slots</dt>
                      <dd>{remainingCopy(selected)}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                    {AVAILABILITY_COPY[selected.availability]}
                  </p>
                  {selected.reservable ? (
                    <Button
                      type="button"
                      className="mt-4 w-full"
                      onClick={() => onReserve?.(selected)}
                    >
                      Reserve
                    </Button>
                  ) : selected.availability === "full_with_waitlist" ? (
                    <Button
                      type="button"
                      className="mt-4 w-full"
                      onClick={() => onReserve?.(selected)}
                    >
                      Join Waitlist
                    </Button>
                  ) : (
                    <Button type="button" className="mt-4 w-full" disabled>
                      {AVAILABILITY_COPY[selected.availability]}
                    </Button>
                  )}
                  <p className="sr-only">Audience {audience}. Coach rates are never shown.</p>
                </>
              )}
            </aside>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
