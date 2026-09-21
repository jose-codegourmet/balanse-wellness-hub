"use client";

import { BALANSE_BREAKPOINTS } from "@balanse/config";
import {
  SESSION_AVAILABILITY_LABELS as AVAILABILITY,
  filterPublicSessions,
  formatPeso,
  formatSessionDate,
  formatSessionTime,
  layoutTimedSessions,
  manilaYmd,
  moveScheduleDate,
  type PublicSession,
  type ScheduleGridView,
  scheduleGridDays,
} from "@balanse/domain";
import {
  CalendarSkeleton,
  detectView,
  FeedbackState,
  type ScheduleCalendarProps,
  useBreakpoint,
} from "@balanse/ui";
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Globe,
  Tag,
  Timer,
  Users,
} from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/jabkit/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/jabkit/dialog";
import { cn } from "@/lib/utils";
import { CoachAvatar } from "./CoachAvatar";
import "./booking-calendar.css";

type EventVariant = "chip" | "timed" | "list";
type EventDensity = "compact" | "full";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_HEIGHT = 72;
const dateLabel = (ymd: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: "Asia/Manila" }).format(
    new Date(`${ymd}T12:00:00+08:00`),
  );
const spots = (session: PublicSession) =>
  session.remainingSlots > 0
    ? `${session.remainingSlots} ${session.remainingSlots === 1 ? "spot" : "spots"} left`
    : "No spots left";
const slotsCopy = (session: PublicSession) =>
  `${session.remainingSlots}/${session.capacity} slots available`;
const slotsAria = (session: PublicSession) =>
  `${session.remainingSlots} of ${session.capacity} slots available`;
const filledPercent = (session: PublicSession) =>
  session.capacity > 0
    ? Math.round(((session.capacity - session.remainingSlots) / session.capacity) * 100)
    : 0;
const sessionDuration = (session: PublicSession) => {
  const minutes = Math.max(
    0,
    Math.round((Date.parse(session.endsAt) - Date.parse(session.startsAt)) / 60_000),
  );
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return hours === 1 ? "1 hr" : `${hours} hr`;
  return `${hours} hr ${rest} min`;
};
const sessionClockRange = (session: PublicSession) => {
  const start = formatSessionTime(session.startsAt);
  const end = formatSessionTime(session.endsAt);
  if (start.slice(-2) === end.slice(-2)) {
    return `${start.slice(0, -3)}-${end}`;
  }
  return `${start}-${end}`;
};
const sessionStatusLabel = (
  session: PublicSession,
  options: { mine?: boolean; becameFull?: boolean } = {},
) => {
  if (options.mine) return "Yours";
  if (options.becameFull) return "Full";
  if (session.availability === "full_with_waitlist") return "Waitlist";
  return AVAILABILITY[session.availability];
};
const capacityCopy = (session: PublicSession, becameFull?: boolean) =>
  becameFull || session.remainingSlots <= 0
    ? "No spots left"
    : `${session.remainingSlots} of ${session.capacity} spots left`;

/** App-owned adaptation of Jabkit FullscreenCalendar's bordered event grid.
 * Jabkit sources stay pristine; customer events open booking details rather than an event editor. */
export function BalanseBookingCalendar({
  sessions,
  classes,
  coaches = [],
  nowIso,
  view = "auto",
  loading,
  loadError,
  initialClassFilter = "all",
  initialCoachFilter = "all",
  onClearFilter,
  onRetry,
  onReserve,
  viewerBookingSessionIds = [],
  sessionBecameFullId,
  audience = "guest",
}: ScheduleCalendarProps) {
  const breakpoint = useBreakpoint();
  const [date, setDate] = useState(() => manilaYmd(nowIso));
  const [classFilter, setClassFilter] = useState(initialClassFilter);
  const [coachFilter, setCoachFilter] = useState(initialCoachFilter);
  const [detailDay, setDetailDay] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLElement>(null);
  const today = manilaYmd(nowIso);
  const resolvedView: ScheduleGridView =
    view === "auto" ? detectView(BALANSE_BREAKPOINTS[breakpoint]) : view;
  useEffect(() => setClassFilter(initialClassFilter), [initialClassFilter]);
  useEffect(() => setCoachFilter(initialCoachFilter), [initialCoachFilter]);

  const filtered = useMemo(
    () =>
      filterPublicSessions(sessions, { classId: classFilter, coachId: coachFilter }).sort((a, b) =>
        a.startsAt.localeCompare(b.startsAt),
      ),
    [sessions, classFilter, coachFilter],
  );
  const days = useMemo(() => scheduleGridDays(date, resolvedView), [date, resolvedView]);
  const timedDays = useMemo(
    () => days.map((day) => ({ day, entries: layoutTimedSessions(filtered, day) })),
    [days, filtered],
  );
  const entries = timedDays.flatMap((day) => day.entries);
  const startHour = Math.min(6, ...entries.map((entry) => Math.floor(entry.start / 60)));
  const endHour = Math.max(22, ...entries.map((entry) => Math.ceil(entry.end / 60)));
  const firstHour = entries.length
    ? Math.floor(Math.min(...entries.map((entry) => entry.start)) / 60)
    : 8;
  const hours = Array.from({ length: endHour - startHour }, (_, index) => startHour + index);
  const sessionsById = new Map(filtered.map((session) => [session.id, session]));
  const coachPhotoById = new Map(coaches.map((coach) => [coach.id, coach.photoKey]));
  const daySessions = detailDay
    ? filtered.filter((session) => manilaYmd(session.startsAt) === detailDay)
    : [];
  const selected = sessions.find((session) => session.id === selectedId);
  const selectedIsViewerBooking = selected ? viewerBookingSessionIds.includes(selected.id) : false;
  const selectedIsFull = Boolean(selected && selected.id === sessionBecameFullId);
  const selectedDescription = selected
    ? classes.find((item) => item.id === selected.classId)?.shortDescription
    : undefined;
  const selectedShowMeter =
    selected != null && selected.availability !== "past" && selected.availability !== "cancelled";
  const noResults = filtered.length === 0 && (classFilter !== "all" || coachFilter !== "all");
  const periodEmpty = !entries.length;
  const coachName =
    coaches.find((coach) => coach.id === coachFilter)?.name ??
    sessions.find((session) => session.coachId === coachFilter)?.coachName;
  const title =
    resolvedView === "day"
      ? dateLabel(date, { weekday: "short", month: "short", day: "numeric" })
      : resolvedView === "week"
        ? `${dateLabel(days[0], { month: "short", day: "numeric" })} – ${dateLabel(days[6], { month: "short", day: "numeric", year: "numeric" })}`
        : dateLabel(date, { month: "long", year: "numeric" });

  // Start near the first class, while keeping the entire hourly day scrollable.
  useEffect(() => {
    if (resolvedView !== "month" && scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, firstHour - startHour - 1) * HOUR_HEIGHT;
    }
  }, [resolvedView, firstHour, startHour]);

  function openSession(session: PublicSession) {
    setSelectedId(session.id);
    setDetailDay(manilaYmd(session.startsAt));
  }
  function eventButton(
    session: PublicSession,
    variant: EventVariant = "chip",
    style?: CSSProperties,
    density?: EventDensity,
  ) {
    const tone =
      Math.max(
        0,
        classes.findIndex((item) => item.id === session.classId),
      ) % 3;
    const mine = viewerBookingSessionIds.includes(session.id);
    const showMeter = session.availability !== "past" && session.availability !== "cancelled";
    const filledPct = filledPercent(session);
    const statusCopy = mine
      ? "Your booking"
      : !session.reservable
        ? session.availability === "full_with_waitlist"
          ? "Waitlist"
          : AVAILABILITY[session.availability]
        : null;
    const availabilityLabel = mine
      ? "your booking"
      : session.reservable
        ? slotsAria(session)
        : `${AVAILABILITY[session.availability]}, ${spots(session)}`;
    const avatar = (
      <CoachAvatar
        photoKey={coachPhotoById.get(session.coachId) ?? null}
        name={session.coachName}
        className="booking-event-avatar"
      />
    );
    const slots =
      !statusCopy && session.reservable ? (
        <span className="booking-event-slots">
          {variant !== "chip" ? (
            <Users className="booking-event-slots-icon" aria-hidden="true" />
          ) : null}
          {slotsCopy(session)}
        </span>
      ) : null;
    const status = statusCopy ? (
      <span className="booking-event-status" data-status={mine ? "yours" : session.availability}>
        {statusCopy}
      </span>
    ) : null;
    const time = (
      <span className="booking-event-time">
        {formatSessionTime(session.startsAt)}
        {variant === "timed" ? `–${formatSessionTime(session.endsAt)}` : ""}
      </span>
    );
    return (
      <button
        key={session.id}
        type="button"
        data-calendar-event={session.id}
        data-tone={tone}
        data-availability={session.availability}
        data-variant={variant}
        data-density={density}
        className={cn("booking-event", variant === "timed" && "booking-event-timed")}
        style={style}
        onClick={() => openSession(session)}
        aria-label={`${session.className}, ${formatSessionDate(session.startsAt)}, ${formatSessionTime(session.startsAt)} to ${formatSessionTime(session.endsAt)}, ${session.coachName}, ${availabilityLabel}`}
      >
        {variant === "chip" ? (
          <>
            <span className="booking-event-lead">{avatar}</span>
            <span className="booking-event-body">
              <span className="booking-event-name">{session.className}</span>
              {time}
              {status}
              {slots}
            </span>
          </>
        ) : (
          <>
            <span className="booking-event-name">{session.className}</span>
            {time}
            <span className="booking-event-coach">
              {avatar}
              {session.coachName}
            </span>
            {status}
            {slots}
          </>
        )}
        {showMeter ? (
          <span className="booking-event-meter" aria-hidden="true">
            <span style={{ width: `${filledPct}%` }} />
          </span>
        ) : null}
      </button>
    );
  }

  if (loading) return <CalendarSkeleton />;
  if (loadError) return <FeedbackState id="calendar.load-failed" onAction={onRetry} />;

  return (
    <section
      className="balanse-booking-calendar"
      aria-label={
        audience === "customer" ? "Your booked class schedule" : "Class schedule calendar"
      }
    >
      <div data-calendar-controls className="booking-calendar-toolbar">
        <div className="booking-period">
          <div className="booking-date-stamp" aria-hidden="true">
            <span>{dateLabel(today, { month: "short" })}</span>
            <strong>{today.slice(8)}</strong>
          </div>
          <div>
            <h3 aria-live="polite">{title}</h3>
            <p>
              {audience === "customer"
                ? "Your booked classes, shown in Philippine time."
                : "Choose a class to view details & book."}
            </p>
          </div>
        </div>
        <div className="booking-calendar-actions">
          <Button variant="secondary" size="sm" onClick={() => setDate(today)}>
            Today
          </Button>
          <div className="booking-paging">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Previous ${resolvedView}`}
              onClick={() => setDate(moveScheduleDate(date, resolvedView, -1))}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Next ${resolvedView}`}
              onClick={() => setDate(moveScheduleDate(date, resolvedView, 1))}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <span className="booking-view-label">{resolvedView}</span>
        </div>
      </div>
      <div className="booking-calendar-filters">
        <label className="booking-class-filter">
          <span>Class</span>
          <select
            aria-label="Filter by class"
            value={classFilter}
            onChange={(event) => setClassFilter(event.target.value)}
          >
            <option value="all">All classes</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        {coachFilter !== "all" ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setCoachFilter("all");
              onClearFilter?.();
            }}
          >
            Coach: {coachName ?? "Selected"} · Clear
          </Button>
        ) : null}
        <span className="booking-timezone">Philippine time · GMT+8</span>
      </div>
      {noResults ? (
        <FeedbackState
          id="calendar.filter-empty"
          onAction={() => {
            setClassFilter("all");
            setCoachFilter("all");
            onClearFilter?.();
          }}
        />
      ) : null}
      {resolvedView === "month" ? (
        <div>
          {periodEmpty && !noResults ? (
            <p className="booking-period-empty" role="status">
              {audience === "customer"
                ? "No booked classes during this month. Try another date."
                : "No classes scheduled this month. Try another date."}
            </p>
          ) : null}
          <div data-calendar-grid="month" className="booking-month">
            {WEEKDAYS.map((day) => (
              <div key={day} className="booking-weekday">
                {day}
              </div>
            ))}
            {days.map((day) => {
              const events = filtered.filter((session) => manilaYmd(session.startsAt) === day);
              return (
                <div
                  key={day}
                  data-calendar-date={day}
                  className={cn(
                    "booking-month-day",
                    day.slice(0, 7) !== date.slice(0, 7) && "booking-outside-month",
                  )}
                >
                  <button
                    className="booking-day-number"
                    type="button"
                    aria-current={day === today ? "date" : undefined}
                    aria-label={`${formatSessionDate(`${day}T12:00:00+08:00`)}, ${events.length} classes`}
                    onClick={() => {
                      setDetailDay(day);
                      setSelectedId(null);
                    }}
                  >
                    {Number(day.slice(8))}
                  </button>
                  <div className="booking-month-events">
                    {events.map((session) => eventButton(session))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div data-calendar-grid={resolvedView} className="booking-time-calendar">
          <div
            className="booking-time-head"
            style={{ gridTemplateColumns: `3.25rem repeat(${days.length}, minmax(0, 1fr))` }}
          >
            <span className="booking-time-caption">GMT+8</span>
            {days.map((day) => (
              <div key={day} className="booking-time-day">
                <span>{dateLabel(day, { weekday: "short" })}</span>
                <strong aria-current={day === today ? "date" : undefined}>
                  {Number(day.slice(8))}
                </strong>
              </div>
            ))}
          </div>
          {periodEmpty && !noResults ? (
            <p className="booking-period-empty" role="status">
              {audience === "customer"
                ? `No booked classes this ${resolvedView}. Try another date.`
                : `No classes scheduled this ${resolvedView}. Try another date.`}
            </p>
          ) : null}
          <section
            className="booking-time-scroll"
            ref={scrollRef}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: The time grid needs keyboard scrolling.
            tabIndex={0}
            aria-label={`Hourly ${resolvedView} schedule, scroll for more hours`}
          >
            <div
              className="booking-time-body"
              style={{
                height: hours.length * HOUR_HEIGHT,
                gridTemplateColumns: `3.25rem repeat(${days.length}, minmax(0, 1fr))`,
              }}
            >
              <div className="booking-time-axis" aria-hidden="true">
                {hours.map((hour) => (
                  <span key={hour} style={{ top: (hour - startHour) * HOUR_HEIGHT }}>
                    {hour % 12 || 12} {hour < 12 ? "AM" : "PM"}
                  </span>
                ))}
              </div>
              {timedDays.map(({ day, entries: dayEntries }) => (
                <div key={day} data-calendar-date={day} className="booking-time-column">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      data-calendar-hour={hour}
                      className="booking-hour"
                      style={{ height: HOUR_HEIGHT }}
                    />
                  ))}
                  {dayEntries.map((entry) => {
                    const session = sessionsById.get(entry.id);
                    return session
                      ? eventButton(
                          session,
                          "timed",
                          {
                            top: (entry.start / 60 - startHour) * HOUR_HEIGHT,
                            height: Math.max(
                              26,
                              ((entry.end - entry.start) / 60) * HOUR_HEIGHT - 3,
                            ),
                            left: `calc(${(entry.column / entry.columns) * 100}% + 3px)`,
                            width: `calc(${100 / entry.columns}% - 6px)`,
                          },
                          entry.end - entry.start < 45 || entry.columns > 2 ? "compact" : "full",
                        )
                      : null;
                  })}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
      <Dialog
        open={detailDay !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailDay(null);
            setSelectedId(null);
          }
        }}
      >
        <DialogContent className="booking-session-dialog sm:max-w-md">
          {selected ? (
            <div
              className="booking-session"
              data-section="session-panel"
              data-availability={selected.availability}
            >
              <div className="booking-session-head">
                <span
                  className="booking-session-status"
                  data-status={selectedIsViewerBooking ? "yours" : selected.availability}
                >
                  {sessionStatusLabel(selected, {
                    mine: selectedIsViewerBooking,
                    becameFull: selectedIsFull,
                  })}
                </span>
              </div>
              <DialogTitle className="booking-session-title pr-8 font-display text-2xl font-normal">
                {selected.className}
              </DialogTitle>
              <div className="booking-session-meta">
                <CalendarDays className="booking-session-icon" aria-hidden="true" />
                <DialogDescription>
                  {formatSessionDate(selected.startsAt)} · {sessionClockRange(selected)}
                </DialogDescription>
              </div>
              {selectedDescription ? (
                <p className="booking-session-blurb">{selectedDescription}</p>
              ) : null}
              <div className="booking-session-coach">
                <CoachAvatar
                  photoKey={coachPhotoById.get(selected.coachId) ?? null}
                  name={selected.coachName}
                  size="lg"
                  className="booking-session-avatar"
                />
                <div>
                  <p className="booking-session-coach-name">{selected.coachName}</p>
                  <p className="booking-session-coach-role">Coach</p>
                </div>
              </div>
              <dl className="booking-session-stats">
                <div>
                  <dt>
                    <Timer className="booking-session-icon" aria-hidden="true" />
                    Duration
                  </dt>
                  <dd>{sessionDuration(selected)}</dd>
                </div>
                <div>
                  <dt>
                    <Tag className="booking-session-icon" aria-hidden="true" />
                    Price
                  </dt>
                  <dd>{formatPeso(selected.pricePhp)}</dd>
                </div>
              </dl>
              <div className="booking-session-capacity" data-availability={selected.availability}>
                <p className="booking-session-capacity-label">
                  <Users className="booking-session-icon" aria-hidden="true" />
                  {capacityCopy(selected, selectedIsFull)}
                </p>
                {selectedShowMeter ? (
                  <span className="booking-session-meter" aria-hidden="true">
                    <span style={{ width: `${filledPercent(selected)}%` }} />
                  </span>
                ) : null}
              </div>
              {selectedIsViewerBooking && audience === "customer" ? (
                <p className="booking-owned-session" role="status">
                  <BadgeCheck className="booking-session-icon" aria-hidden="true" />
                  This class is on your schedule.
                </p>
              ) : selectedIsFull ? (
                <FeedbackState
                  id="calendar.session-became-full"
                  onAction={() => onReserve?.(selected)}
                />
              ) : (
                <div className="booking-session-actions">
                  <Button
                    className="w-full rounded-full"
                    disabled={
                      !selected.reservable && selected.availability !== "full_with_waitlist"
                    }
                    onClick={() => onReserve?.(selected)}
                  >
                    {selected.reservable
                      ? "Reserve"
                      : selected.availability === "full_with_waitlist"
                        ? "Join Waitlist"
                        : AVAILABILITY[selected.availability]}
                  </Button>
                  <p className="booking-session-footnote">
                    <Globe className="booking-session-icon" aria-hidden="true" />
                    Philippine time · GMT+8
                  </p>
                </div>
              )}
            </div>
          ) : detailDay ? (
            <>
              <DialogTitle className="pr-8 font-display text-2xl font-normal">
                {dateLabel(detailDay, { month: "long", day: "numeric" })}
              </DialogTitle>
              <DialogDescription>
                Choose a class to see availability and reserve your space.
              </DialogDescription>
              {daySessions.length ? (
                <ul className="booking-day-list" aria-label="Classes on selected day">
                  {daySessions.map((session) => (
                    <li key={session.id}>{eventButton(session, "list")}</li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-sm text-muted-foreground">
                  No classes scheduled for this day. Explore another date.
                </p>
              )}
            </>
          ) : (
            <>
              <DialogTitle className="sr-only">Class details</DialogTitle>
              <DialogDescription className="sr-only">
                Choose a class to see availability and reserve your space.
              </DialogDescription>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
