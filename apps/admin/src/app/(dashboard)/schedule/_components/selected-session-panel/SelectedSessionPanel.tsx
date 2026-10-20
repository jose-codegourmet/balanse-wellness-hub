"use client";

import { apiFetchBrowser } from "@balanse/api-client/browser";
import {
  type AdminSession,
  auditConfirmationCopy,
  eventStatusLabel,
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
  manilaYmd,
  sessionChangeRuleLabels,
  sessionDisplayName,
  sessionStatusLabel,
  venueKindLabel,
} from "@balanse/domain";
import { Badge, Button, Skeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  CalendarPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  MapPinIcon,
  PencilIcon,
  Repeat2Icon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CoachOption } from "@/components/balanse/coach/coach-option/CoachOption";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import {
  PublicShareAction,
  sessionShareTarget,
} from "@/components/balanse/public-share-action/PublicShareAction";
import { adminNowIso } from "@/lib/clock";
import { useCancelAdminSession } from "@/lib/query/mutations";
import {
  adminClassesQuery,
  adminCoachesQuery,
  adminEventForSessionQuery,
  adminVenuesQuery,
} from "@/lib/query/queries";
import { cn } from "@/lib/utils";
import {
  useCanAdminAction,
  useCanAdminRoute,
  useStaffActor,
} from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { createSessionHref, editSessionHref, rosterHref } from "../../_lib/schedule-href";
import { ClassChangeSessionActions } from "../class-change-session-actions/ClassChangeSessionActions";
import { DaySessionTimeline } from "../day-session-timeline/DaySessionTimeline";
import type { SessionTimeMove } from "../day-session-timeline/DaySessionTimeline.meta";
import { SessionMoveReview } from "../session-move-review/SessionMoveReview";
import type { SelectedSessionPanelProps, SessionInventory } from "./SelectedSessionPanel.meta";

function dayLabel(ymd: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "Asia/Manila" }).format(
    new Date(`${ymd}T04:00:00.000Z`),
  );
}

export function SelectedSessionPanel({
  ymd,
  daySessions,
  allSessions,
  selectedSessionId,
  onSelectSession,
  onClose,
  inventory,
  hideClose = false,
}: SelectedSessionPanelProps) {
  const [move, setMove] = useState<SessionTimeMove | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const canMove = useCanAdminAction("schedule-update");
  useEffect(() => {
    if (selectedSessionId) detailHeading.current?.focus();
  }, [selectedSessionId]);
  const canCreate = useCanAdminAction("schedule-create");
  const selected = daySessions.find((session) => session.id === selectedSessionId) ?? null;
  const live = daySessions.filter((session) => session.status !== "CANCELLED");
  const openSpots = live.reduce((total, session) => total + session.remainingSlots, 0);
  const totalSpots = live.reduce((total, session) => total + session.capacity, 0);

  return (
    <div
      ref={panelRef}
      className="relative flex h-full min-h-0 flex-col bg-card"
      data-slot="schedule-day-panel"
    >
      <div className={cn("min-h-0 flex-1 flex-col", selected ? "hidden" : "flex")}>
        <header className="shrink-0 border-b border-border px-5 pt-4 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.625rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                {dayLabel(ymd, { weekday: "long" })}
              </p>
              <h2 className="font-display text-3xl leading-tight">
                {dayLabel(ymd, { month: "long", day: "numeric" })}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {daySessions.length === 0
                  ? "Nothing scheduled"
                  : `${daySessions.length} ${daySessions.length === 1 ? "session" : "sessions"} · ${openSpots} of ${totalSpots} spots open`}
              </p>
            </div>
            {hideClose ? null : (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close day"
                onClick={onClose}
              >
                <XIcon />
              </Button>
            )}
          </div>
          {canCreate ? (
            <Button
              nativeButton={false}
              variant="outline"
              size="sm"
              className="mt-3"
              render={<Link href={createSessionHref(ymd)} />}
            >
              <CalendarPlusIcon aria-hidden />
              New session on this day
            </Button>
          ) : null}
        </header>

        <p className="shrink-0 border-b border-border px-5 py-2 text-[0.6875rem] text-muted-foreground">
          Philippine time ·{" "}
          {canMove ? "Drag a grip to change time, then review." : "Select a session for details."}
        </p>
        <DaySessionTimeline
          key={ymd}
          ymd={ymd}
          sessions={daySessions}
          canMove={canMove}
          onSelect={onSelectSession}
          onReviewMove={setMove}
        />
      </div>
      {selected ? (
        <div
          className="absolute inset-0 flex min-h-0 flex-col bg-card"
          data-slot="session-details-overlay"
        >
          <header className="shrink-0 border-b border-border px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSelectSession(null);
                  requestAnimationFrame(() => {
                    const button = Array.from(
                      panelRef.current?.querySelectorAll<HTMLButtonElement>(
                        "[data-timeline-session-id]",
                      ) ?? [],
                    ).find((element) => element.dataset.timelineSessionId === selected.id);
                    button?.focus({ preventScroll: true });
                  });
                }}
              >
                <ArrowLeftIcon aria-hidden />
                Back to day
              </Button>
              {!hideClose ? (
                <Button variant="ghost" size="icon-sm" aria-label="Close day" onClick={onClose}>
                  <XIcon />
                </Button>
              ) : null}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <h2 ref={detailHeading} tabIndex={-1} className="text-sm font-semibold outline-none">
                {dayLabel(ymd, { month: "long", day: "numeric" })}
              </h2>
              <div className="flex items-center gap-1">
                <span className="mr-1 text-xs text-muted-foreground">
                  {daySessions.findIndex((row) => row.id === selected.id) + 1} /{" "}
                  {daySessions.length}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Previous session"
                  disabled={selected.id === daySessions[0]?.id}
                  onClick={() =>
                    onSelectSession(
                      daySessions[daySessions.findIndex((row) => row.id === selected.id) - 1].id,
                    )
                  }
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next session"
                  disabled={selected.id === daySessions.at(-1)?.id}
                  onClick={() =>
                    onSelectSession(
                      daySessions[daySessions.findIndex((row) => row.id === selected.id) + 1].id,
                    )
                  }
                >
                  <ChevronRightIcon />
                </Button>
              </div>
            </div>
          </header>
          <div key={selected.id} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <SessionDetail session={selected} inventory={inventory} ymd={ymd} />
          </div>
        </div>
      ) : null}
      {move ? (
        <SessionMoveReview move={move} sessions={allSessions} onClose={() => setMove(null)} />
      ) : null}
    </div>
  );
}

function SessionDetail({
  session,
  inventory,
  ymd,
}: {
  session: AdminSession;
  inventory: SessionInventory | null;
  ymd: string;
}) {
  const cancel = useCancelAdminSession();
  const actor = useStaffActor();
  const canReadCoaches = useCanAdminRoute("/coaches");
  const coachesQuery = useQuery({
    ...adminCoachesQuery(actor, apiFetchBrowser),
    enabled: canReadCoaches,
  });
  const venuesQuery = useQuery(adminVenuesQuery(actor, apiFetchBrowser));
  const classesQuery = useQuery(adminClassesQuery(actor, apiFetchBrowser));
  const classSlug = classesQuery.data?.find((row) => row.id === session.classId)?.slug;
  const canCancelSession = useCanAdminAction("schedule-cancel");
  const canUpdateSession = useCanAdminAction("schedule-update");
  const canOpenRoster = useCanAdminAction("roster-read");
  const canRecur = useCanAdminAction("schedule-recurrence");
  const canReadEvents = useCanAdminRoute("/events");
  const canManageEvents = useCanAdminAction("events-manage");
  const eventQuery = useQuery({
    ...adminEventForSessionQuery(actor, session.id, apiFetchBrowser),
    enabled: canReadEvents,
  });
  const linkedEvent = eventQuery.data;
  const venue = venuesQuery.data?.find((row) => row.id === session.venueId);
  const coaches = session.coaches.map(
    (coach) => coachesQuery.data?.find((row) => row.id === coach.id) ?? coach,
  );
  const cancelled = session.status === "CANCELLED";
  // A session already under way (or over) cannot get a new event; only show an existing one.
  const started = Date.parse(session.startsAt) <= Date.now();
  const showEvent = canReadEvents && (!started || Boolean(linkedEvent));
  const eventReadsCancelled = cancelled || linkedEvent?.status === "CANCELLED";
  const taken = inventory ? inventory.confirmed + inventory.held : 0;
  const fill =
    inventory && session.capacity > 0 ? Math.min(100, (taken / session.capacity) * 100) : 0;

  return (
    <section aria-label={`${sessionDisplayName(session)} details`} className="grid gap-5 px-5 py-5">
      <div className="grid gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={session.status === "PUBLISHED" ? "success" : cancelled ? "danger" : "warning"}
          >
            {sessionStatusLabel(session.status)}
          </Badge>
          {session.recurrenceRuleId ? (
            <Badge variant="neutral">
              <Repeat2Icon aria-hidden />
              Weekly series
            </Badge>
          ) : null}
          {sessionChangeRuleLabels(session).map((label) => (
            <Badge key={label} variant="neutral">
              {label}
            </Badge>
          ))}
        </div>
        <h3 className={cn("font-display text-2xl leading-tight", cancelled && "line-through")}>
          {sessionDisplayName(session)}
        </h3>
        <p className="text-sm text-muted-foreground">
          {manilaYmd(session.startsAt) < ymd
            ? `Started ${formatSessionDate(session.startsAt)} · `
            : null}
          {formatSessionTimeRange(session.startsAt, session.endsAt)} ·{" "}
          {formatPeso(session.pricePhp)}
        </p>
        {venue ? (
          <p className="flex items-center gap-1.5 text-sm">
            <MapPinIcon aria-hidden className="size-3.5 shrink-0 text-primary" />
            <span className="min-w-0 truncate">{venue.name}</span>
            <Badge variant={venue.kind === "OFFSITE" ? "accent" : "neutral"} size="sm">
              {venueKindLabel(venue.kind)}
            </Badge>
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <SectionLabel>Coaches</SectionLabel>
        <div className="grid gap-2">
          {coaches.map((coach) => (
            <CoachOption key={coach.id} coach={coach} layout="row" className="min-w-0" />
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <SectionLabel>Capacity</SectionLabel>
          {inventory ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {taken} of {session.capacity} taken
            </span>
          ) : null}
        </div>
        {inventory ? (
          <>
            <span className="h-1.5 overflow-hidden rounded-full bg-muted">
              <span className="block h-full bg-primary" style={{ width: `${fill}%` }} />
            </span>
            <dl className="grid grid-cols-4 gap-1.5">
              <Stat label="Confirmed" value={inventory.confirmed} />
              <Stat label="Held" value={inventory.held} />
              <Stat label="Waitlist" value={inventory.waitlisted} />
              <Stat label="Open" value={inventory.available} />
            </dl>
          </>
        ) : (
          <Skeleton className="h-14 w-full" />
        )}
      </div>

      {showEvent ? (
        <div className="grid gap-2">
          <SectionLabel>Event</SectionLabel>
          <div className="rounded-md border border-border bg-background px-3 py-3 text-sm">
            {eventQuery.isPending ? (
              <p className="text-muted-foreground">Checking for an event…</p>
            ) : eventQuery.isError ? (
              <p className="text-muted-foreground">The event link could not be loaded.</p>
            ) : linkedEvent ? (
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate font-semibold">{linkedEvent.title}</p>
                  <Badge variant={eventReadsCancelled ? "danger" : "neutral"} size="sm">
                    {eventReadsCancelled ? eventStatusLabel("CANCELLED") : linkedEvent.statusLabel}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    render={<Link href={`/events/${linkedEvent.id}`} />}
                  >
                    View event
                  </Button>
                  {canManageEvents ? (
                    <Button
                      nativeButton={false}
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/schedule/${session.id}/event`} />}
                    >
                      Edit event
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : cancelled ? (
              <p className="text-muted-foreground">Cancelled sessions cannot have an event.</p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground">No event on this session.</p>
                {canManageEvents ? (
                  <Button
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    render={<Link href={`/schedule/${session.id}/event`} />}
                  >
                    <SparklesIcon aria-hidden />
                    Create event
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="grid gap-2">
        <SectionLabel>Share</SectionLabel>
        <PublicShareAction target={sessionShareTarget(session, classSlug, venue?.name)} />
      </div>

      <ClassChangeSessionActions session={session} canCancelDirectly={canCancelSession} />

      <div className="grid gap-2">
        {canOpenRoster ? (
          <Button
            nativeButton={false}
            className="w-full"
            render={<Link href={rosterHref(session.id)} />}
          >
            <ClipboardListIcon aria-hidden />
            View roster
          </Button>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          {canUpdateSession ? (
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link href={editSessionHref(session.id)} />}
            >
              <PencilIcon aria-hidden />
              Edit
            </Button>
          ) : null}
          {!cancelled && canRecur && !session.recurrenceRuleId ? (
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link href={`/schedule/${session.id}/recurrence`} />}
            >
              <Repeat2Icon aria-hidden />
              Repeat weekly
            </Button>
          ) : null}
        </div>
        {!cancelled && canCancelSession ? (
          <div className="mt-2 border-t border-border pt-3">
            <ConfirmAction
              triggerLabel="Cancel session"
              title="Cancel this session?"
              description={`${auditConfirmationCopy("Cancel session", "Admin", adminNowIso())} Affected bookings enter manual refund handling. The session stays in history.`}
              variant="destructive"
              onConfirm={async () => {
                try {
                  await cancel.mutateAsync(session.id);
                  notify.admin("session.cancelled");
                } catch {
                  notify.admin("session.cancel-failed");
                }
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.625rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/60 px-2 py-1.5">
      <dt className="text-[0.625rem] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
