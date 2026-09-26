"use client";

import { EVENT_CONFLICT_MESSAGES, formatSessionRange, sessionStatusLabel } from "@balanse/domain";
import { Badge, Button, DetailPageSkeleton, FeedbackState } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { CoachOption } from "@/components/balanse/coach/coach-option/CoachOption";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import {
  adminBookingsQuery,
  adminClassesQuery,
  adminEventDetailQuery,
  adminSessionsQuery,
} from "@/lib/query/queries";
import { useCanAdminRoute } from "@/modules/authorization/useAdminAccess";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import {
  displayedEventStatus,
  displayedEventStatusLabel,
  eventBookedCount,
  eventClassName,
  eventPriceLabel,
  eventPublishBlocked,
  eventSessionCancelled,
  eventSessionCoaches,
  eventStatusHistory,
  formatEventInstant,
  formatRegistrationWindow,
} from "../../_lib/event-display";
import type { EventDetailPageProps } from "./EventDetailPage.meta";

function statusVariant(status: ReturnType<typeof displayedEventStatus>) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  if (status === "ARCHIVED") return "neutral" as const;
  return "warning" as const;
}

export function EventDetailPage({ eventId, loading, error, preview }: EventDetailPageProps) {
  const router = useRouter();
  const { principal } = useMockPrincipal();
  const canReadClasses = useCanAdminRoute("/classes");
  const canReadBookings = useCanAdminRoute("/bookings");
  const canReadSessions = useCanAdminRoute("/schedule");
  const eventQuery = useQuery({
    ...adminEventDetailQuery(principal, eventId),
    enabled: preview === undefined,
  });
  const classesQuery = useQuery({
    ...adminClassesQuery(principal),
    enabled: canReadClasses,
  });
  const bookingsQuery = useQuery({
    ...adminBookingsQuery(principal),
    enabled: canReadBookings,
  });
  const sessionsQuery = useQuery({
    ...adminSessionsQuery(principal),
    enabled: canReadSessions,
  });

  const event = preview !== undefined ? preview : eventQuery.data;
  const showLoading = loading || (preview === undefined && eventQuery.isPending);
  const showError = error || (preview === undefined && eventQuery.isError);

  if (showLoading) {
    return (
      <AdminPageShell
        title="Event"
        breadcrumb={[{ label: "Events", href: "/events" }, { label: "Event" }]}
      >
        <DetailPageSkeleton label="Loading event" />
      </AdminPageShell>
    );
  }

  if (showError) {
    return (
      <AdminPageShell
        title="Event"
        breadcrumb={[{ label: "Events", href: "/events" }, { label: "Event" }]}
      >
        <FeedbackState
          id="calendar.load-failed"
          className="mt-2"
          title="Could not load this event"
          description="The event did not load. Retry the request."
          onAction={() => {
            void eventQuery.refetch();
          }}
        />
      </AdminPageShell>
    );
  }

  if (!event) {
    return (
      <AdminPageShell
        title="Event"
        breadcrumb={[{ label: "Events", href: "/events" }, { label: "Not found" }]}
      >
        <FeedbackState
          id="admin.event-not-found"
          className="mt-2"
          onAction={() => {
            router.push("/events");
          }}
        />
      </AdminPageShell>
    );
  }

  const status = displayedEventStatus(event);
  const className = eventClassName(event, classesQuery.data);
  const coaches = eventSessionCoaches(event, sessionsQuery.data);
  const booked = eventBookedCount(event, bookingsQuery.data);
  const publishBlocked = eventPublishBlocked(event);
  const sessionCancelled = eventSessionCancelled(event);
  const history = eventStatusHistory(event);
  const sessionHref = `/schedule/${event.sessionId}`;
  const rosterHref = `/sessions/${event.sessionId}/roster`;

  return (
    <AdminPageShell
      eyebrow="Operations"
      title={event.title}
      description={event.summary || "Session event"}
      breadcrumb={[{ label: "Events", href: "/events" }, { label: event.title }]}
      actions={
        <Badge variant={statusVariant(status)} appearance="solid" size="md" dot>
          {displayedEventStatusLabel(event)}
        </Badge>
      }
    >
      {sessionCancelled ? (
        <p
          role="status"
          className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm"
        >
          This session was cancelled, so the event reads as cancelled.
        </p>
      ) : null}
      {publishBlocked ? (
        <div
          role="status"
          className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
        >
          <p>{EVENT_CONFLICT_MESSAGES.event_publish_requires_published_session}</p>
          <SessionLink href={sessionHref} className="mt-2 inline-flex">
            Publish the session
          </SessionLink>
        </div>
      ) : null}
      {event.status === "CANCELLED" && !sessionCancelled ? (
        <p role="status" className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
          This event is cancelled. The session and its bookings stay as they are. Cancel the session
          from the schedule when that is the intent.
        </p>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="grid gap-6">
          <Poster poster={event.posterImage} title={event.title} />
          <Section title="Description">
            <p className="whitespace-pre-wrap text-sm leading-6">
              {event.description || "No description yet."}
            </p>
          </Section>
          <Section title="Venue">
            <p className="text-sm">{event.venueName || "No venue name"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {event.venueAddress || "No venue address"}
            </p>
          </Section>
          <Section title="Beneficiary">
            <p className="text-sm">{event.beneficiary || "No beneficiary listed."}</p>
          </Section>
          <Section title="What to bring">
            <p className="whitespace-pre-wrap text-sm leading-6">
              {event.whatToBring || "Nothing listed."}
            </p>
          </Section>
          <Section title="Registration window">
            <p className="text-sm">{formatRegistrationWindow(event)}</p>
          </Section>
          {event.galleryImages.length > 0 ? (
            <Section title="Gallery">
              <ul className="grid gap-2 text-sm">
                {event.galleryImages.map((image) => (
                  <li key={image}>{image}</li>
                ))}
              </ul>
            </Section>
          ) : null}
          <Section title="Internal notes">
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {event.internalNotes || "No internal notes."}
            </p>
          </Section>
        </article>

        <aside className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-display text-2xl">Linked session</h2>
          <p className="mt-3 text-sm font-medium">{className}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatSessionRange(event.session.startsAt, event.session.endsAt)}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            <Stat label="Capacity" value={String(event.session.capacity)} />
            <Stat label="Booked" value={String(booked)} />
            <Stat label="Price" value={eventPriceLabel(event)} />
            <Stat label="Session" value={sessionStatusLabel(event.session.status)} />
          </dl>
          {event.isPlaceholder ? (
            <p className="mt-3 text-xs text-muted-foreground">
              This session price is a non-authoritative placeholder (OQ-PRICE).
            </p>
          ) : null}
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground">Assigned coaches</p>
            {coaches.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No coaches assigned on this session.
              </p>
            ) : (
              <ul className="mt-2 grid gap-2">
                {coaches.map((coach) => (
                  <li key={coach.id}>
                    <CoachOption coach={coach} layout="row" />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <SessionLink href={sessionHref}>Open session</SessionLink>
            <RosterLink href={rosterHref}>Open roster</RosterLink>
          </div>
        </aside>
      </div>

      <section>
        <h2 className="font-display text-2xl">Status history</h2>
        <ol className="mt-3 grid gap-2">
          {history.map((entry) => (
            <li key={entry.id} className="rounded-xl border border-border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge appearance="soft" size="sm">
                  {entry.statusLabel}
                </Badge>
                <time dateTime={entry.at} className="text-muted-foreground">
                  {formatEventInstant(entry.at)} (Asia/Manila)
                </time>
              </div>
              <p className="mt-2">{entry.detail}</p>
            </li>
          ))}
        </ol>
      </section>
    </AdminPageShell>
  );
}

function Poster({ poster, title }: { poster: string | null; title: string }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <h2 className="sr-only">Poster</h2>
      {poster && (poster.startsWith("http") || poster.startsWith("/")) ? (
        // Object keys are not public URLs; only absolute or site paths render as images.
        <img src={poster} alt="" className="max-h-72 w-full object-cover" />
      ) : (
        <p className="p-4 text-sm text-muted-foreground">
          {poster ? `Poster file: ${poster}` : `No poster for ${title}.`}
        </p>
      )}
    </section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function SessionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const allowed = useCanAdminRoute(href);
  if (!allowed) return null;
  return (
    <Button
      nativeButton={false}
      variant="outline"
      className={className}
      render={<Link href={href} />}
    >
      {children}
    </Button>
  );
}

function RosterLink({ href, children }: { href: string; children: ReactNode }) {
  const allowed = useCanAdminRoute(href);
  if (!allowed) return null;
  return (
    <Button nativeButton={false} variant="outline" render={<Link href={href} />}>
      {children}
    </Button>
  );
}
