"use client";

import {
  type AdminEvent,
  type AdminSession,
  EVENT_CONFLICT_MESSAGES,
  formatPeso,
  formatSessionRange,
  sessionDisplayName,
  sessionStatusLabel,
} from "@balanse/domain";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  FeedbackState,
  FormPageSkeleton,
  Input,
} from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { ImageUpload } from "@/components/balanse/image-upload/ImageUpload";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import {
  useArchiveAdminEvent,
  useCancelAdminEvent,
  useCreateAdminEvent,
  usePublishAdminEvent,
  useUpdateAdminEvent,
} from "@/lib/query/mutations";
import {
  adminClassesQuery,
  adminEventForSessionQuery,
  adminEventsQuery,
  adminSessionsQuery,
} from "@/lib/query/queries";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import {
  DateBinding,
  ImageBinding,
  TextareaBinding,
  TextBinding,
  TimeBinding,
} from "@/modules/admin/forms/bindings";
import { useCanAdminAction } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { eventFormDefaultValues, eventFormValuesFromEvent } from "./EventFormPage.defaults";
import type { EventFormPageProps } from "./EventFormPage.meta";
import {
  type EventFormValues,
  eventFormSchema,
  eventInstantFromParts,
} from "./EventFormPage.schema";

const GALLERY_LIMIT = 12;

type SessionChoice = {
  id: string;
  className: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  priceLabel: string;
  statusLabel: string;
  status: AdminSession["status"];
  blocked: "cancelled" | "taken" | null;
  eventId?: string;
  eventTitle?: string;
  pricePlaceholder: boolean;
};

export function EventFormPage(props: EventFormPageProps) {
  const canManage = useCanAdminAction("events-manage");
  if (!canManage) {
    return (
      <AdminPageShell
        title="Session event"
        breadcrumb={[{ label: "Events", href: "/events" }, { label: "Event" }]}
      >
        <AccessDenied kind="denied" homeHref="/events" />
      </AdminPageShell>
    );
  }
  return <EventFormAuthorized {...props} />;
}

function EventFormAuthorized({
  sessionId,
  previewDialog,
  showValidationErrors = false,
  previewValues,
}: EventFormPageProps) {
  const { principal } = useMockPrincipal();
  const bound = Boolean(sessionId);
  const sessionsQuery = useQuery(adminSessionsQuery(principal));
  const classesQuery = useQuery(adminClassesQuery(principal));
  const eventsQuery = useQuery(adminEventsQuery(principal));
  const eventQuery = useQuery({
    ...adminEventForSessionQuery(principal, sessionId ?? ""),
    enabled: bound,
  });
  const createEvent = useCreateAdminEvent();
  const updateEvent = useUpdateAdminEvent();
  const publishEvent = usePublishAdminEvent();
  const cancelEvent = useCancelAdminEvent();
  const archiveEvent = useArchiveAdminEvent();
  const router = useRouter();

  const pending =
    sessionsQuery.isPending ||
    classesQuery.isPending ||
    eventsQuery.isPending ||
    (bound && eventQuery.isPending);
  const failed =
    sessionsQuery.isError || classesQuery.isError || eventsQuery.isError || eventQuery.isError;

  if (pending) {
    return (
      <AdminPageShell title="Session event">
        <FormPageSkeleton label="Loading event form" sections={3} fields={8} />
      </AdminPageShell>
    );
  }

  if (failed) {
    return (
      <AdminPageShell title="Session event">
        <FeedbackState
          id="calendar.load-failed"
          className="mt-2"
          title="Could not load the event form"
          description="Sessions or the event did not load. Retry the request."
          onAction={() => {
            void sessionsQuery.refetch();
            void classesQuery.refetch();
            void eventsQuery.refetch();
            if (bound) void eventQuery.refetch();
          }}
        />
      </AdminPageShell>
    );
  }

  const sessions = sessionsQuery.data ?? [];
  const events = eventsQuery.data ?? [];
  const classes = classesQuery.data ?? [];
  const existing = bound ? (eventQuery.data ?? null) : null;
  const live = bound ? sessions.find((session) => session.id === sessionId) : undefined;

  if (bound && !existing && !live) {
    return (
      <AdminPageShell
        title="Session not found"
        breadcrumb={[{ label: "Schedule", href: "/schedule" }, { label: "Event" }]}
      >
        <FeedbackState
          id="admin.event-not-found"
          className="mt-2"
          title="Session not found"
          description="This session is not on the schedule, so an event cannot be created for it."
          onAction={() => router.push("/schedule")}
        />
      </AdminPageShell>
    );
  }

  if (bound && !existing && live?.status === "CANCELLED") {
    return (
      <AdminPageShell
        title="Session event"
        breadcrumb={[
          { label: "Schedule", href: "/schedule" },
          { label: sessionDisplayName(live), href: `/schedule/${live.id}` },
          { label: "Event" },
        ]}
      >
        <p role="status" className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
          {EVENT_CONFLICT_MESSAGES.event_on_cancelled_session}
        </p>
      </AdminPageShell>
    );
  }

  const choices = buildSessionChoices(sessions, events, classes);
  const boundChoice = existing
    ? choiceFromEvent(existing, classes)
    : live
      ? choiceFromLive(live, events.find((event) => event.sessionId === live.id) ?? null)
      : null;
  const defaults: EventFormValues = existing
    ? eventFormValuesFromEvent(existing)
    : {
        ...eventFormDefaultValues,
        sessionId: live?.id ?? "",
        ...previewValues,
      };

  const title = existing ? `Edit ${existing.title}` : "Create event";
  const sessionCrumb = boundChoice?.className ?? "Session";

  return (
    <AdminPageShell
      eyebrow="Operations"
      title={title}
      description="Event details wrap one session. Date, time, capacity, and price stay on that session."
      breadcrumb={
        bound
          ? [
              { label: "Schedule", href: "/schedule" },
              {
                label: sessionCrumb,
                href: sessionId ? `/schedule/${sessionId}` : "/schedule",
              },
              { label: "Event" },
            ]
          : [{ label: "Events", href: "/events" }, { label: "New event" }]
      }
    >
      <AdminForm
        id="event-form"
        key={`${existing?.id ?? sessionId ?? "new"}:${existing?.updatedAt ?? "create"}`}
        schema={eventFormSchema}
        defaultValues={defaults}
        onSubmit={async (values) => {
          const body = toWriteBody(values);
          try {
            if (existing) {
              const { sessionId: _sessionId, ...patch } = body;
              await updateEvent.mutateAsync({ id: existing.id, patch });
              notify.admin("event.saved");
              router.push(`/events/${existing.id}`);
              return;
            }
            const created = await createEvent.mutateAsync(body);
            notify.admin("event.saved");
            router.push(`/events/${created.id}`);
          } catch (error) {
            notify.admin("event.save-failed");
            throw error;
          }
        }}
      >
        <RevealValidationErrors enabled={showValidationErrors} />
        {bound && boundChoice ? (
          <SessionFacts choice={boundChoice} />
        ) : (
          <SessionPicker choices={choices} />
        )}
        <EventFields />
        {existing && boundChoice ? (
          <EventLifecycle
            event={existing}
            choice={boundChoice}
            previewDialog={previewDialog}
            onPublish={async () => {
              if (boundChoice.status === "DRAFT") {
                notify.admin("event.publish-blocked");
                return;
              }
              if (boundChoice.status === "CANCELLED") return;
              try {
                await publishEvent.mutateAsync(existing.id);
                notify.admin("event.published");
              } catch (error) {
                if (isPublishBlocked(error)) notify.admin("event.publish-blocked");
                else notify.admin("event.save-failed");
              }
            }}
            onCancel={async () => {
              try {
                await cancelEvent.mutateAsync(existing.id);
                notify.admin("event.cancelled");
              } catch {
                notify.admin("event.cancel-failed");
              }
            }}
            onArchive={async () => {
              try {
                await archiveEvent.mutateAsync(existing.id);
                notify.admin("event.archived");
              } catch {
                notify.admin("event.archive-failed");
              }
            }}
          />
        ) : null}
        <FormActions
          formId="event-form"
          submitLabel={existing ? "Save event" : "Create event"}
          cancelHref={existing ? `/events/${existing.id}` : "/events"}
          cancelLabel="Back"
        />
      </AdminForm>
    </AdminPageShell>
  );
}

function RevealValidationErrors({ enabled }: { enabled: boolean }) {
  const form = useAdminFormContext<EventFormValues>();
  const ran = useRef(false);
  useEffect(() => {
    if (!enabled || ran.current) return;
    ran.current = true;
    void form.trigger();
  }, [enabled, form]);
  return null;
}

function SessionFacts({ choice }: { choice: SessionChoice }) {
  return (
    <FormSection
      title="Linked session"
      surface="card"
      description="Saving this event does not change the session date, time, capacity, or price. Edit those on the session form."
    >
      <SessionFactsBody choice={choice} />
    </FormSection>
  );
}

function SessionFactsBody({ choice }: { choice: SessionChoice }) {
  return (
    <div className="grid gap-2 text-sm">
      <p className="font-medium">{choice.className}</p>
      <p className="text-muted-foreground">{formatSessionRange(choice.startsAt, choice.endsAt)}</p>
      <p>
        Capacity {choice.capacity} · {choice.priceLabel} · {choice.statusLabel}
      </p>
      {choice.pricePlaceholder ? (
        <p className="text-xs text-muted-foreground">
          This session price is a non-authoritative placeholder (OQ-PRICE).
        </p>
      ) : null}
      <p>Saving this event does not change the session date, time, capacity, or price.</p>
      <Button
        nativeButton={false}
        variant="outline"
        className="w-fit"
        render={<Link href={`/schedule/${choice.id}`} />}
      >
        Edit session date, time, capacity, and price
      </Button>
    </div>
  );
}

function SessionPicker({ choices }: { choices: SessionChoice[] }) {
  const form = useAdminFormContext<EventFormValues>();
  const selected = form.watch("sessionId");
  const [search, setSearch] = useState("");
  const needle = search.trim().toLowerCase();
  const visible = choices.filter((choice) => {
    if (!needle) return true;
    return (
      choice.className.toLowerCase().includes(needle) ||
      choice.statusLabel.toLowerCase().includes(needle) ||
      (choice.eventTitle?.toLowerCase().includes(needle) ?? false)
    );
  });
  const selectedChoice = choices.find((choice) => choice.id === selected && !choice.blocked);

  return (
    <FormSection
      title="Session"
      surface="card"
      description="An event needs one existing session that is not cancelled and does not already have an event."
    >
      <FormField name="sessionId" label="Session" required>
        {(field) => (
          <div className="grid gap-3">
            <Input
              aria-label="Filter sessions"
              placeholder="Filter by class, state, or event title"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div
              className="grid max-h-80 gap-2 overflow-y-auto"
              role="radiogroup"
              aria-label="Session"
            >
              {visible.map((choice) => {
                const unavailable = choice.blocked !== null;
                return (
                  <div key={choice.id} className="rounded-lg border border-border px-3 py-2">
                    <label className="flex items-start gap-3 text-sm">
                      <input
                        type="radio"
                        name="event-session"
                        className="mt-1"
                        value={choice.id}
                        checked={selected === choice.id}
                        disabled={unavailable}
                        onChange={() => {
                          field.onChange(choice.id);
                        }}
                      />
                      <span className="grid gap-1">
                        <span className="font-medium">{choice.className}</span>
                        <span className="text-muted-foreground">
                          {formatSessionRange(choice.startsAt, choice.endsAt)}
                        </span>
                        <span>
                          Capacity {choice.capacity} · {choice.priceLabel} · {choice.statusLabel}
                        </span>
                      </span>
                    </label>
                    {choice.blocked === "taken" ? (
                      <p className="mt-2 text-sm">
                        {EVENT_CONFLICT_MESSAGES.event_session_taken}{" "}
                        {choice.eventId ? (
                          <Link
                            className="underline underline-offset-4"
                            href={`/events/${choice.eventId}`}
                          >
                            Open {choice.eventTitle ?? "the event"}
                          </Link>
                        ) : null}
                      </p>
                    ) : null}
                    {choice.blocked === "cancelled" ? (
                      <p className="mt-2 text-sm">
                        {EVENT_CONFLICT_MESSAGES.event_on_cancelled_session}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </FormField>
      {selectedChoice ? <SessionFactsBody choice={selectedChoice} /> : null}
    </FormSection>
  );
}

function EventFields() {
  const form = useAdminFormContext<EventFormValues>();
  const title = form.watch("title");
  const gallery = form.watch("galleryImages");

  return (
    <>
      <FormSection title="Event content" surface="card">
        <FormField name="title" label="Title" required maxLength={120}>
          {(field) => <TextBinding {...field} placeholder="Pilates for a Cause" />}
        </FormField>
        <FormField name="summary" label="Summary" optional maxLength={500}>
          {(field) => <TextareaBinding {...field} rows={2} />}
        </FormField>
        <FormField name="description" label="Description" optional maxLength={8000}>
          {(field) => <TextareaBinding {...field} rows={5} />}
        </FormField>
        <FormField
          name="posterImage"
          label="Poster"
          optional
          description="Uses the same pending upload token as a class cover. No new upload path."
        >
          {(field) => (
            <ImageBinding
              {...field}
              label="Poster"
              fallbackLabel="Event"
              previewName={title || "Event"}
              value={typeof field.value === "string" ? field.value : ""}
              onChange={(next) => field.onChange(typeof next === "string" ? next : "")}
            />
          )}
        </FormField>
        <FormField
          name="galleryImages"
          label="Gallery"
          optional
          description={`Up to ${GALLERY_LIMIT} images. Each one is a pending upload token.`}
        >
          {(field) => (
            <div className="grid gap-3">
              {gallery.length > 0 ? (
                <ul className="grid gap-2">
                  {gallery.map((image, index) => (
                    <li
                      key={`${image}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate">{image}</span>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          field.onChange(gallery.filter((_, item) => item !== index));
                        }}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No gallery images yet.</p>
              )}
              {gallery.length < GALLERY_LIMIT ? (
                <ImageUpload
                  label="Add gallery image"
                  fallbackLabel="Gallery"
                  previewName={title || "Event"}
                  photoKey={null}
                  onPhotoKeyChange={(next) => {
                    if (!next || gallery.includes(next)) return;
                    field.onChange([...gallery, next]);
                  }}
                />
              ) : null}
            </div>
          )}
        </FormField>
      </FormSection>
      <FormSection title="Venue and cause" surface="card" columns={2}>
        <FormField name="venueName" label="Venue name" optional maxLength={160}>
          {(field) => <TextBinding {...field} placeholder="Mandani Bay — Garden Area" />}
        </FormField>
        <FormField name="venueAddress" label="Venue address" optional maxLength={240}>
          {(field) => <TextBinding {...field} />}
        </FormField>
        <FormField name="beneficiary" label="Beneficiary" optional maxLength={200}>
          {(field) => <TextBinding {...field} />}
        </FormField>
        <FormField name="whatToBring" label="What to bring" optional maxLength={2000}>
          {(field) => <TextareaBinding {...field} rows={3} />}
        </FormField>
      </FormSection>
      <FormSection
        title="Registration window"
        surface="card"
        description="Optional. This does not replace the session booking cutoff. Times are Asia/Manila."
        columns={2}
      >
        <FormField name="registrationOpensOn" label="Opens on" optional>
          {(field) => <DateBinding {...field} value={stringValue(field.value)} />}
        </FormField>
        <FormField name="registrationOpensAtTime" label="Opens at" optional>
          {(field) => <TimeBinding {...field} value={stringValue(field.value)} />}
        </FormField>
        <FormField name="registrationClosesOn" label="Closes on" optional>
          {(field) => <DateBinding {...field} value={stringValue(field.value)} />}
        </FormField>
        <FormField name="registrationClosesAtTime" label="Closes at" optional>
          {(field) => <TimeBinding {...field} value={stringValue(field.value)} />}
        </FormField>
      </FormSection>
      <FormSection title="Internal notes" surface="card">
        <FormField
          name="internalNotes"
          label="Internal notes"
          optional
          description="Staff only. Customers never see this."
          maxLength={4000}
        >
          {(field) => <TextareaBinding {...field} rows={4} />}
        </FormField>
      </FormSection>
    </>
  );
}

function EventLifecycle({
  event,
  choice,
  previewDialog,
  onPublish,
  onCancel,
  onArchive,
}: {
  event: AdminEvent;
  choice: SessionChoice;
  previewDialog?: "cancel" | "archive";
  onPublish: () => Promise<void>;
  onCancel: () => Promise<void>;
  onArchive: () => Promise<void>;
}) {
  const [dialog, setDialog] = useState<"cancel" | "archive" | null>(previewDialog ?? null);
  const publishBlocked = choice.status === "DRAFT";
  const sessionCancelled = choice.status === "CANCELLED";
  const canPublish = event.status === "DRAFT" || event.status === "CANCELLED";
  const canCancel = event.status === "DRAFT" || event.status === "PUBLISHED";
  const canArchive = event.status !== "ARCHIVED";
  const sessionHref = `/schedule/${choice.id}`;

  return (
    <FormSection
      title="Publication"
      surface="card"
      description="Publishing, cancelling, or archiving this event leaves the session and its bookings in place."
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{event.statusLabel}</Badge>
        {event.status === "PUBLISHED" ? (
          <p className="text-sm text-muted-foreground">
            This event is published. Cancel or archive it to take it off the active list. The
            session and its bookings stay as they are.
          </p>
        ) : null}
      </div>
      {publishBlocked ? (
        <div
          role="status"
          className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
        >
          <p>{EVENT_CONFLICT_MESSAGES.event_publish_requires_published_session}</p>
          <Button
            nativeButton={false}
            variant="outline"
            className="mt-2"
            render={<Link href={sessionHref} />}
          >
            Publish the session
          </Button>
        </div>
      ) : null}
      {sessionCancelled ? (
        <p role="status" className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
          This session is cancelled, so the event cannot be published.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {canPublish && !sessionCancelled ? (
          <Button
            type="button"
            onClick={() => {
              void onPublish();
            }}
          >
            Publish event
          </Button>
        ) : null}
        {canCancel ? (
          <LifecycleDialog
            open={dialog === "cancel"}
            triggerLabel="Cancel event"
            title="Cancel this event?"
            confirmLabel="Cancel event"
            sessionHref={sessionHref}
            onOpenChange={(open) => setDialog(open ? "cancel" : null)}
            onConfirm={() => {
              setDialog(null);
              void onCancel();
            }}
          >
            This cancels the event only. It does not cancel the session or its bookings, and it does
            not delete history. Cancel the session from the schedule when that is the real intent
            (admin flow F).
          </LifecycleDialog>
        ) : null}
        {canArchive ? (
          <LifecycleDialog
            open={dialog === "archive"}
            triggerLabel="Archive event"
            title="Archive this event?"
            confirmLabel="Archive event"
            sessionHref={sessionHref}
            onOpenChange={(open) => setDialog(open ? "archive" : null)}
            onConfirm={() => {
              setDialog(null);
              void onArchive();
            }}
          >
            Archiving keeps the event on file and does not delete the session, its bookings, or
            history. It does not cancel the session. Cancel the session from the schedule when that
            is the real intent (admin flow F).
          </LifecycleDialog>
        ) : null}
      </div>
    </FormSection>
  );
}

function LifecycleDialog({
  open,
  triggerLabel,
  title,
  confirmLabel,
  sessionHref,
  onOpenChange,
  onConfirm,
  children,
}: {
  open: boolean;
  triggerLabel: string;
  title: string;
  confirmLabel: string;
  sessionHref: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  children: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger render={<Button type="button" variant="outline" />}>
        {triggerLabel}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{children}</AlertDialogDescription>
        </AlertDialogHeader>
        <Button nativeButton={false} variant="outline" render={<Link href={sessionHref} />}>
          Open the session to cancel it
        </Button>
        <AlertDialogFooter>
          <AlertDialogCancel>Back</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function toWriteBody(values: EventFormValues) {
  return {
    sessionId: values.sessionId,
    title: values.title,
    summary: values.summary,
    description: values.description,
    posterImage: values.posterImage || null,
    galleryImages: values.galleryImages,
    venueName: values.venueName,
    venueAddress: values.venueAddress,
    beneficiary: values.beneficiary,
    whatToBring: values.whatToBring,
    internalNotes: values.internalNotes,
    registrationOpensAt: eventInstantFromParts(
      values.registrationOpensOn,
      values.registrationOpensAtTime,
    ),
    registrationClosesAt: eventInstantFromParts(
      values.registrationClosesOn,
      values.registrationClosesAtTime,
    ),
  };
}

function isPublishBlocked(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message === EVENT_CONFLICT_MESSAGES.event_publish_requires_published_session ||
    error.message.includes("cannot be published")
  );
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function buildSessionChoices(
  sessions: readonly AdminSession[],
  events: readonly AdminEvent[],
  classes: readonly { id: string; name: string }[],
): SessionChoice[] {
  const liveIds = new Set(sessions.map((session) => session.id));
  const fromLive = sessions.map((session) =>
    choiceFromLive(session, events.find((event) => event.sessionId === session.id) ?? null),
  );
  const fromEvents = events
    .filter((event) => !liveIds.has(event.sessionId))
    .map((event) => choiceFromEvent(event, classes));
  return [...fromLive, ...fromEvents].sort(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
  );
}

function choiceFromLive(session: AdminSession, event: AdminEvent | null): SessionChoice {
  const blocked = session.status === "CANCELLED" ? "cancelled" : event ? "taken" : null;
  return {
    id: session.id,
    className: sessionDisplayName(session),
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    capacity: session.capacity,
    priceLabel: formatPeso(session.pricePhp),
    status: session.status,
    statusLabel: sessionStatusLabel(session.status),
    blocked,
    eventId: event?.id,
    eventTitle: event?.title,
    pricePlaceholder: event?.isPlaceholder ?? false,
  };
}

function choiceFromEvent(
  event: AdminEvent,
  classes: readonly { id: string; name: string }[],
): SessionChoice {
  const amount = Number(event.session.customerPrice);
  return {
    id: event.sessionId,
    className:
      classes.find((row) => row.id === event.session.classId)?.name ?? event.session.classId,
    startsAt: event.session.startsAt,
    endsAt: event.session.endsAt,
    capacity: event.session.capacity,
    priceLabel: Number.isFinite(amount) ? formatPeso(amount) : event.session.customerPrice,
    status: event.session.status,
    statusLabel: event.session.statusLabel,
    blocked: event.session.status === "CANCELLED" ? "cancelled" : "taken",
    eventId: event.id,
    eventTitle: event.title,
    pricePlaceholder: event.isPlaceholder,
  };
}
