"use client";

import {
  formatSessionTimeRange,
  layoutTimedSessions,
  manilaYmd,
  sessionDisplayName,
} from "@balanse/domain";
import { GripVerticalIcon, LockKeyholeIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { adminNowIso } from "@/lib/clock";
import { cn } from "@/lib/utils";
import type { DaySessionTimelineProps } from "./DaySessionTimeline.meta";

const HOUR_HEIGHT = 88;
const PX_PER_MINUTE = HOUR_HEIGHT / 60;
const HOUR_LABELS = Array.from(
  { length: 24 },
  (_, hour) => `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`,
);
type MoveState = { id: string; minute: number };

export function DaySessionTimeline({
  ymd,
  sessions,
  canMove,
  onSelect,
  onReviewMove,
  nowIso,
}: DaySessionTimelineProps) {
  const [clock, setClock] = useState(() => nowIso ?? adminNowIso());
  const [move, setMove] = useState<MoveState | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const scrollRef = useRef<HTMLElement>(null);
  const gesture = useRef<{
    id: string;
    y: number;
    lastY: number;
    scroll: number;
    minute: number;
    pointerId: number;
  } | null>(null);
  const moveRef = useRef<MoveState | null>(null);
  const midnight = new Date(`${ymd}T00:00:00+08:00`).getTime();
  const entries = layoutTimedSessions(sessions, ymd);
  const sessionsById = new Map(sessions.map((session) => [session.id, session]));
  const today = manilaYmd(clock) === ymd;
  const nowMinute = (Date.parse(clock) - midnight) / 60_000;

  useEffect(() => {
    if (nowIso) return;
    const timer = window.setInterval(() => setClock(adminNowIso()), 15_000);
    return () => window.clearInterval(timer);
  }, [nowIso]);

  // Mount once per selected day; the parent retains this element under the details overlay.
  useEffect(() => {
    const first =
      entries.find(
        (entry) => Date.parse(sessionsById.get(entry.id)?.endsAt ?? "") > Date.parse(clock),
      ) ?? entries[0];
    if (scrollRef.current && sessions.length)
      scrollRef.current.scrollTop =
        Math.max(0, (first?.start ?? (today ? nowMinute : 8 * 60)) - 60) * PX_PER_MINUTE;
    // Day changes remount this component; live updates must not reset the user's scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function eligible(id: string) {
    const session = sessionsById.get(id);
    return Boolean(
      canMove &&
        session &&
        manilaYmd(session.startsAt) === ymd &&
        session.status !== "CANCELLED" &&
        Date.parse(session.startsAt) > Date.parse(nowIso ?? adminNowIso()),
    );
  }
  function preview(id: string, minute: number) {
    setAnnouncement("");
    const session = sessionsById.get(id);
    if (!session) return;
    const next = {
      id,
      // The start stays on this day; the end may roll into the next one.
      minute: Math.max(0, Math.min(1440 - 15, Math.round(minute / 15) * 15)),
    };
    moveRef.current = next;
    setMove(next);
  }
  function cancelMove() {
    gesture.current = null;
    moveRef.current = null;
    setMove(null);
  }
  function review() {
    const next = moveRef.current;
    cancelMove();
    if (!next) return;
    const session = sessionsById.get(next.id);
    if (!session) return;
    const start = midnight + next.minute * 60_000;
    if (!eligible(session.id) || start <= Date.parse(nowIso ?? adminNowIso())) {
      setAnnouncement("Choose a future time. Sessions that have started cannot be moved.");
      return;
    }
    if (start === Date.parse(session.startsAt)) return;
    onReviewMove({
      session,
      startsAt: new Date(start).toISOString(),
      endsAt: new Date(
        start + Date.parse(session.endsAt) - Date.parse(session.startsAt),
      ).toISOString(),
    });
  }

  useEffect(() => {
    if (!move || !gesture.current) return;
    let frame: number;
    function tick() {
      const g = gesture.current;
      const scroller = scrollRef.current;
      if (!g || !scroller) return;
      const rect = scroller.getBoundingClientRect();
      const direction = g.lastY < rect.top + 40 ? -1 : g.lastY > rect.bottom - 40 ? 1 : 0;
      if (direction) {
        scroller.scrollTop += direction * 8;
        preview(g.id, g.minute + (g.lastY - g.y + scroller.scrollTop - g.scroll) / PX_PER_MINUTE);
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // Gesture geometry lives in refs; restarting on each pointer move would interrupt scrolling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(move)]);

  return (
    <section
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      aria-label="Day timeline, Philippine time"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll the hourly timeline.
      tabIndex={0}
    >
      {announcement ? (
        <p
          role="status"
          className="sticky top-0 z-40 border-b border-border bg-card px-3 py-2 text-xs text-destructive"
        >
          {announcement}
        </p>
      ) : null}
      {sessions.length === 0 ? (
        <p className="border-b border-border px-5 py-3 text-sm text-muted-foreground">
          Nothing scheduled. Add a session to this day.
        </p>
      ) : null}
      <div className="relative mr-3 ml-14" style={{ height: 24 * HOUR_HEIGHT }}>
        {HOUR_LABELS.map((label, hour) => (
          <div
            key={hour}
            className="absolute inset-x-0 border-t border-border/70"
            style={{ top: hour * HOUR_HEIGHT }}
          >
            <span className="absolute -left-12 top-1 w-10 text-right text-[0.625rem] text-muted-foreground tabular-nums">
              {label}
            </span>
            <span
              className="absolute inset-x-0 border-t border-dashed border-border/40"
              style={{ top: HOUR_HEIGHT / 2 }}
            />
          </div>
        ))}
        {entries.map((entry) => {
          const session = sessionsById.get(entry.id);
          if (!session) return null;
          const started = Date.parse(session.startsAt) <= Date.parse(clock);
          const continuing = manilaYmd(session.startsAt) < ymd;
          const active = move?.id === entry.id;
          const start = active ? move.minute : entry.start;
          const duration = (Date.parse(session.endsAt) - Date.parse(session.startsAt)) / 60_000;
          const visibleEnd = active ? Math.min(1440, start + duration) : entry.end;
          const movable = eligible(entry.id) && duration <= 1440;
          const range = active
            ? formatSessionTimeRange(
                new Date(midnight + start * 60_000).toISOString(),
                new Date(midnight + (start + duration) * 60_000).toISOString(),
              )
            : formatSessionTimeRange(
                continuing ? new Date(midnight).toISOString() : session.startsAt,
                session.endsAt,
              );
          const displayRange = continuing ? `Continues from previous day · ${range}` : range;
          const invalid = active && midnight + start * 60_000 <= Date.parse(clock);
          return (
            <div
              key={entry.id}
              className={cn(
                "absolute flex overflow-hidden rounded-md border border-l-[3px] border-border border-l-primary bg-secondary shadow-sm",
                session.status === "CANCELLED" && "opacity-60",
                started && "border-l-muted-foreground bg-muted/60 text-muted-foreground",
                session.status === "DRAFT" && "border-dashed",
                active && "z-20 ring-2 ring-primary",
                invalid && "ring-destructive",
              )}
              style={{
                top: start * PX_PER_MINUTE + 1,
                height: Math.max(24, (visibleEnd - start) * PX_PER_MINUTE - 3),
                left: `calc(${(entry.column / entry.columns) * 100}% + 2px)`,
                width: `calc(${100 / entry.columns}% - 4px)`,
              }}
            >
              <button
                type="button"
                data-timeline-session-id={entry.id}
                onClick={() => {
                  cancelMove();
                  onSelect(entry.id);
                }}
                className="flex min-w-0 flex-1 flex-col items-start justify-start overflow-hidden px-2 py-1.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                aria-label={`${sessionDisplayName(session)}, ${displayRange}. View details`}
                title={`${sessionDisplayName(session)} · ${displayRange} · ${session.coachName}`}
              >
                <span
                  className={cn(
                    "block truncate text-xs font-semibold",
                    session.status === "CANCELLED" && "line-through",
                  )}
                >
                  {sessionDisplayName(session)}
                </span>
                <span className="block text-[0.625rem] tabular-nums">{displayRange}</span>
                {entry.end - entry.start >= 60 ? (
                  <span className="block truncate text-[0.625rem] text-muted-foreground">
                    {session.coachName}
                  </span>
                ) : null}
              </button>
              {movable ? (
                <button
                  type="button"
                  className="w-9 shrink-0 touch-none cursor-grab self-stretch border-l border-border/50 active:cursor-grabbing focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  aria-label={`Move ${sessionDisplayName(session)}. Use up or down arrows, then Enter to review.`}
                  title="Drag to change time · Arrow keys move 15 minutes · Enter to review"
                  onPointerDown={(event) => {
                    if (event.button !== 0 || !eligible(entry.id)) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    gesture.current = {
                      id: entry.id,
                      y: event.clientY,
                      lastY: event.clientY,
                      minute: entry.start,
                      scroll: scrollRef.current?.scrollTop ?? 0,
                      pointerId: event.pointerId,
                    };
                    moveRef.current = { id: entry.id, minute: entry.start };
                    setMove(moveRef.current);
                  }}
                  onPointerMove={(event) => {
                    const g = gesture.current;
                    if (!g || g.pointerId !== event.pointerId) return;
                    g.lastY = event.clientY;
                    preview(
                      g.id,
                      g.minute +
                        (event.clientY - g.y + (scrollRef.current?.scrollTop ?? 0) - g.scroll) /
                          PX_PER_MINUTE,
                    );
                  }}
                  onPointerUp={(event) => {
                    const g = gesture.current;
                    if (g?.pointerId === event.pointerId) {
                      if (
                        Math.abs(event.clientY - g.y) < 4 &&
                        (scrollRef.current?.scrollTop ?? 0) === g.scroll
                      )
                        cancelMove();
                      else review();
                    }
                  }}
                  onPointerCancel={cancelMove}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      event.stopPropagation();
                      cancelMove();
                    }
                    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                      event.preventDefault();
                      preview(
                        entry.id,
                        (moveRef.current?.id === entry.id ? moveRef.current.minute : entry.start) +
                          (event.key === "ArrowDown" ? 15 : -15),
                      );
                    }
                    if (event.key === "Enter" && moveRef.current) {
                      event.preventDefault();
                      review();
                    }
                  }}
                >
                  <GripVerticalIcon className="mx-auto size-3.5" aria-hidden />
                </button>
              ) : (
                <span
                  className="self-start p-1.5 text-muted-foreground"
                  title={
                    canMove
                      ? continuing
                        ? "Move this session from its start day"
                        : "Started or cancelled sessions cannot be moved"
                      : "You do not have permission to move sessions"
                  }
                >
                  <LockKeyholeIcon className="size-3" aria-hidden />
                </span>
              )}
            </div>
          );
        })}
        {today ? (
          <div
            className="pointer-events-none absolute inset-x-0 z-30 border-t-2 border-destructive"
            style={{ top: nowMinute * PX_PER_MINUTE }}
            role="img"
            aria-label={`Current time ${formatSessionTimeRange(clock, clock).split(" – ")[0]}`}
          >
            <span className="absolute -left-1 -top-1.5 size-2.5 rounded-full bg-destructive" />
          </div>
        ) : null}
      </div>
      <p className="sr-only" aria-live="polite">
        {move
          ? `Proposed start ${new Date(midnight + move.minute * 60000).toLocaleTimeString("en-US", { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit" })}`
          : ""}
      </p>
    </section>
  );
}
