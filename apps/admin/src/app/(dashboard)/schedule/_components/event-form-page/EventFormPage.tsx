"use client";

import {
  type AdminEvent,
  type AdminSession,
  type AdminVenue,
  EVENT_CONFLICT_MESSAGES,
  formatPeso,
  formatSessionDate,
  formatSessionRange,
  formatSessionTime,
  formatSessionTimeRange,
  sessionDisplayName,
  sessionStatusLabel,
  venueKindLabel,
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
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FeedbackState,
  FormPageSkeleton,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Switch,
} from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  ArchiveIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleSlashIcon,
  EllipsisIcon,
  EyeIcon,
  InfoIcon,
  LockIcon,
  MapPinIcon,
  PencilIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type MutableRefObject,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { Path } from "react-hook-form";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { mintPendingPhotoKey } from "@/components/balanse/image-upload/ImageUpload";
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
  adminVenuesQuery,
} from "@/lib/query/queries";
import { cn } from "@/lib/utils";
import {
  AdminForm,
  FormActions,
  FormField,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import {
  DateBinding,
  TextareaBinding,
  TextBinding,
  TimeBinding,
} from "@/modules/admin/forms/bindings";
import { useUnsavedChangesGuard } from "@/modules/admin/forms/useUnsavedChangesGuard";
import { useCanAdminAction } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { SessionFormPage } from "../session-form-page/SessionFormPage";
import { eventFormDefaultValues, eventFormValuesFromEvent } from "./EventFormPage.defaults";
import type { EventFormPageProps, EventFormStepId } from "./EventFormPage.meta";
import {
  type EventFormValues,
  eventFormSchema,
  eventInstantFromParts,
} from "./EventFormPage.schema";
import { EventImageTile } from "./event-image-tile/EventImageTile";
import { EventPreviewCard } from "./event-preview-card/EventPreviewCard";
import { EventSessionPicker, type SessionChoice } from "./event-session-picker/EventSessionPicker";
import { EventStepRail, type EventStepStatus } from "./event-step-rail/EventStepRail";

const GALLERY_LIMIT = 12;

const REGISTRATION_FIELDS = [
  "registrationOpensOn",
  "registrationOpensAtTime",
  "registrationClosesOn",
  "registrationClosesAtTime",
] as const satisfies readonly Path<EventFormValues>[];

type StepDef = {
  id: EventFormStepId;
  title: string;
  hint: string;
  fields: readonly Path<EventFormValues>[];
};

type SubmitIntent = "save" | "publish";

function composerSteps(bound: boolean, editing: boolean): StepDef[] {
  const steps: StepDef[] = [
    { id: "session", title: "Session", hint: "Pick the slot", fields: ["sessionId"] },
    {
      id: "story",
      title: "Story",
      hint: "Title, copy, and cause",
      fields: ["title", "summary", "description", "beneficiary"],
    },
    {
      id: "look",
      title: "Look",
      hint: "Poster and gallery",
      fields: ["posterImage", "galleryImages"],
    },
    {
      id: "logistics",
      title: "Logistics",
      hint: "Venue, bring, and registration",
      fields: ["whatToBring", ...REGISTRATION_FIELDS, "internalNotes"],
    },
    {
      id: "review",
      title: "Review",
      hint: editing ? "Check and save" : "Check and publish",
      fields: [],
    },
  ];
  return bound ? steps.filter((step) => step.id !== "session") : steps;
}

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
  previewStep,
  showValidationErrors = false,
  previewValues,
}: EventFormPageProps) {
  const { principal } = useMockPrincipal();
  const bound = Boolean(sessionId);
  const sessionsQuery = useQuery(adminSessionsQuery(principal));
  const classesQuery = useQuery(adminClassesQuery(principal));
  const eventsQuery = useQuery(adminEventsQuery(principal));
  const venuesQuery = useQuery(adminVenuesQuery(principal));
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
  const intentRef = useRef<SubmitIntent>("save");

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

  const venues = venuesQuery.data ?? [];
  const choices = buildSessionChoices(sessions, events, classes, venues);
  const boundChoice = existing
    ? choiceFromEvent(existing, classes)
    : live
      ? choiceFromLive(live, events.find((event) => event.sessionId === live.id) ?? null, venues)
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
      className="overflow-x-clip"
      eyebrow="Operations"
      title={title}
      description={
        existing
          ? "Jump to any step to make changes. Date, time, capacity, and price stay on the linked session."
          : "Build the event in a few short steps. Date, time, capacity, and price stay on the linked session."
      }
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
      actions={
        existing && boundChoice ? (
          <EventLifecycleActions
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
        ) : undefined
      }
    >
      <AdminForm
        id="event-form"
        key={`${existing?.id ?? sessionId ?? "new"}:${existing?.updatedAt ?? "create"}`}
        schema={eventFormSchema}
        defaultValues={defaults}
        onSubmit={async (values) => {
          const body = toWriteBody(values);
          const publish = intentRef.current === "publish";
          intentRef.current = "save";
          try {
            let eventId: string;
            if (existing) {
              const { sessionId: _sessionId, ...patch } = body;
              await updateEvent.mutateAsync({ id: existing.id, patch });
              eventId = existing.id;
            } else {
              const created = await createEvent.mutateAsync(body);
              eventId = created.id;
            }
            if (publish) {
              try {
                await publishEvent.mutateAsync(eventId);
                notify.admin("event.published");
              } catch {
                notify.admin("event.saved");
                notify.admin("event.publish-blocked");
              }
            } else {
              notify.admin("event.saved");
            }
            router.push(`/events/${eventId}`);
          } catch (error) {
            notify.admin("event.save-failed");
            throw error;
          }
        }}
      >
        <RevealValidationErrors enabled={showValidationErrors} />
        <EventComposer
          bound={bound}
          existing={existing}
          choices={choices}
          boundChoice={boundChoice}
          intentRef={intentRef}
          previewStep={previewStep}
          liveSessionIds={new Set(sessions.map((session) => session.id))}
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

function EventComposer({
  bound,
  existing,
  choices,
  boundChoice,
  intentRef,
  previewStep,
  liveSessionIds,
}: {
  bound: boolean;
  existing: AdminEvent | null;
  choices: SessionChoice[];
  boundChoice: SessionChoice | null;
  intentRef: MutableRefObject<SubmitIntent>;
  previewStep?: EventFormStepId;
  /** Sessions on the schedule. Fixture-only event sessions cannot be edited from here. */
  liveSessionIds: ReadonlySet<string>;
}) {
  const form = useAdminFormContext<EventFormValues>();
  const editing = existing !== null;
  const steps = useMemo(() => composerSteps(bound, editing), [bound, editing]);
  const initialIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === previewStep),
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [reached, setReached] = useState(editing || previewStep ? steps.length - 1 : 0);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const previewsRef = useRef(previews);
  const topRef = useRef<HTMLDivElement>(null);
  const handledSubmit = useRef(form.formState.submitCount);
  const guard = useUnsavedChangesGuard(form.formState.isDirty);
  const canCreateSession = useCanAdminAction("schedule-create");
  const canUpdateSession = useCanAdminAction("schedule-update");
  /** "new" opens the create form; a session id opens that session for editing. */
  const [sessionDialog, setSessionDialog] = useState<string | null>(null);

  const values = form.watch();
  const { errors } = form.formState;
  const current = steps[currentIndex] ?? steps[0];
  const isLast = currentIndex === steps.length - 1;
  const selected =
    boundChoice ??
    choices.find((choice) => choice.id === values.sessionId && !choice.blocked) ??
    null;
  const sessionPublishable = selected !== null && selected.status === "PUBLISHED";
  const offerPublish =
    sessionPublishable &&
    (!existing || existing.status === "DRAFT" || existing.status === "CANCELLED");
  const cancelHref = existing
    ? `/events/${existing.id}`
    : bound && selected
      ? `/schedule/${selected.id}`
      : "/events";

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      for (const url of Object.values(previewsRef.current)) URL.revokeObjectURL(url);
    };
  }, []);

  const { subscribe, getFieldId } = form;

  // Step validation runs through trigger(), so re-check a flagged field as it is edited.
  const { trigger, getFieldState } = form;
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ name }) => {
          if (!name) return;
          const root = name.split(".")[0] as Path<EventFormValues>;
          if (getFieldState(root).invalid) void trigger(root);
        },
      }),
    [subscribe, trigger, getFieldState],
  );

  // After a submit attempt, open the first step that holds an error.
  useEffect(
    () =>
      subscribe({
        formState: { submitCount: true, errors: true },
        callback: (state) => {
          const count = state.submitCount ?? 0;
          if (count === handledSubmit.current) return;
          handledSubmit.current = count;
          const failed = state.errors ?? {};
          const index = steps.findIndex((step) => step.fields.some((name) => name in failed));
          if (index < 0) return;
          setCurrentIndex(index);
          const name = steps[index]?.fields.find((field) => field in failed);
          requestAnimationFrame(() => {
            const id = name ? getFieldId(name) : undefined;
            if (id) document.getElementById(id)?.focus();
          });
        },
      }),
    [subscribe, getFieldId, steps],
  );

  function stepStatus(index: number): EventStepStatus {
    if (index === currentIndex) return "current";
    if (steps[index]?.fields.some((name) => name in errors)) return "error";
    if (index > reached) return "locked";
    if (index < currentIndex || index <= reached) return "complete";
    return "upcoming";
  }

  async function goTo(index: number) {
    if (index === currentIndex || index < 0 || index >= steps.length) return;
    if (!editing && index > currentIndex) {
      const fields = steps.slice(currentIndex, index).flatMap((step) => [...step.fields]);
      if (fields.length > 0 && !(await form.trigger(fields))) return;
    }
    setCurrentIndex(index);
    setReached((value) => Math.max(value, index));
    const top = topRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goToStep(id: EventFormStepId) {
    void goTo(steps.findIndex((step) => step.id === id));
  }

  function submit(intent: SubmitIntent) {
    intentRef.current = intent;
    form.requestSubmit();
  }

  function attachImage(file: File): string {
    const token = mintPendingPhotoKey();
    const url = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [token]: url }));
    return token;
  }

  function imageSrc(value: string): string | null {
    if (!value) return null;
    if (previews[value]) return previews[value];
    return value.startsWith("/") || value.startsWith("http") ? value : null;
  }

  const preview = (
    <EventPreviewCard
      title={values.title}
      summary={values.summary}
      posterSrc={imageSrc(values.posterImage)}
      posterPending={values.posterImage.length > 0}
      beneficiary={values.beneficiary}
      venueName={selected?.venue?.name ?? ""}
      galleryCount={values.galleryImages.length}
      session={selected}
    />
  );

  return (
    <div
      ref={topRef}
      className="grid scroll-mt-4 gap-6 lg:grid-cols-[12.5rem_minmax(0,1fr)] xl:grid-cols-[12.5rem_minmax(0,1fr)_17rem]"
    >
      <div className="lg:sticky lg:top-4 lg:self-start">
        <EventStepRail
          steps={steps.map((step, index) => ({
            id: step.id,
            title: step.title,
            hint: step.hint,
            status: stepStatus(index),
          }))}
          onSelect={(id) => goToStep(id as EventFormStepId)}
        />
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SessionChip
            choice={selected}
            editable={!bound && current.id !== "session"}
            picking={current.id === "session"}
            onChange={() => goToStep("session")}
          />
          <Sheet>
            <SheetTrigger
              render={<Button type="button" variant="outline" size="sm" className="xl:hidden" />}
            >
              <EyeIcon aria-hidden />
              Preview
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto p-4">
              <SheetHeader className="p-0">
                <SheetTitle>Customer preview</SheetTitle>
              </SheetHeader>
              <div className="mx-auto w-full max-w-sm">{preview}</div>
            </SheetContent>
          </Sheet>
        </div>

        {!bound ? (
          <StepPanel
            active={current.id === "session"}
            title="Which session is this event for?"
            description="Pick an upcoming session, or create one here. Its date, time, venue, capacity, and price become the event's. Sessions that already have an event or are cancelled are hidden."
          >
            <FormField name="sessionId" label="Session" required>
              {(field) => (
                <EventSessionPicker
                  choices={choices}
                  value={stringValue(field.value)}
                  invalid={"sessionId" in errors}
                  onChange={(id) => field.onChange(id)}
                  onCreateSession={canCreateSession ? () => setSessionDialog("new") : undefined}
                />
              )}
            </FormField>
          </StepPanel>
        ) : null}

        <StepPanel
          active={current.id === "story"}
          title="Tell the story"
          description="What people read first. Keep the summary short — it shows on cards."
        >
          <FormField name="title" label="Title" required maxLength={120}>
            {(field) => <TextBinding {...field} placeholder="Pilates for a Cause" />}
          </FormField>
          <FormField
            name="summary"
            label="Summary"
            optional
            maxLength={500}
            description="One or two sentences for event cards."
          >
            {(field) => (
              <TextareaBinding {...field} rows={2} placeholder="One morning, one mat, one cause." />
            )}
          </FormField>
          <FormField name="description" label="Description" optional maxLength={8000}>
            {(field) => (
              <TextareaBinding
                {...field}
                rows={6}
                placeholder="What happens on the day, who it's for, and why it matters."
              />
            )}
          </FormField>
          <CauseField />
        </StepPanel>

        <StepPanel
          active={current.id === "look"}
          title="Make it look good"
          description="A poster sells the event. Gallery images show on the event page. Uploads stay in this browser until saved (mock upload)."
        >
          <div className="grid gap-6 sm:grid-cols-[11rem_minmax(0,1fr)]">
            <FormField name="posterImage" label="Poster" optional description="Portrait, 4:5.">
              {(field) => {
                const value = stringValue(field.value);
                return (
                  <EventImageTile
                    label="Add poster"
                    aspect="poster"
                    value={value}
                    src={imageSrc(value)}
                    invalid={"posterImage" in errors}
                    onPick={(file) => field.onChange(attachImage(file))}
                    onRemove={() => field.onChange("")}
                  />
                );
              }}
            </FormField>
            <FormField
              name="galleryImages"
              label="Gallery"
              optional
              description={`${values.galleryImages.length} of ${GALLERY_LIMIT} images.`}
            >
              {(field) => {
                const gallery = Array.isArray(field.value) ? (field.value as string[]) : [];
                return (
                  <div className="grid w-full grid-cols-3 gap-2">
                    {gallery.map((image, index) => (
                      <EventImageTile
                        key={`${image}-${index}`}
                        label={`Add image ${index + 1}`}
                        aspect="square"
                        value={image}
                        src={imageSrc(image)}
                        onPick={(file) => {
                          const next = [...gallery];
                          next[index] = attachImage(file);
                          field.onChange(next);
                        }}
                        onRemove={() => field.onChange(gallery.filter((_, item) => item !== index))}
                      />
                    ))}
                    {gallery.length < GALLERY_LIMIT ? (
                      <EventImageTile
                        label="Add image"
                        aspect="square"
                        value=""
                        src={null}
                        onPick={(file) => field.onChange([...gallery, attachImage(file)])}
                      />
                    ) : null}
                  </div>
                );
              }}
            </FormField>
          </div>
        </StepPanel>

        <StepPanel
          active={current.id === "logistics"}
          title="Plan the day"
          description="Where it happens, what to bring, and when people can register."
        >
          <SubSection
            title="Where"
            description="The venue belongs to the session. The studio can keep running classes while this event happens somewhere else."
          >
            <SessionVenue
              choice={selected}
              onChange={
                selected && canUpdateSession && liveSessionIds.has(selected.id)
                  ? () => setSessionDialog(selected.id)
                  : undefined
              }
            />
            <FormField name="whatToBring" label="What to bring" optional maxLength={2000}>
              {(field) => (
                <TextareaBinding {...field} rows={3} placeholder="Mat, water bottle, towel" />
              )}
            </FormField>
          </SubSection>
          <RegistrationWindow />
          <StaffNotes />
        </StepPanel>

        <StepPanel
          active={current.id === "review"}
          title={editing ? "Review your changes" : "Ready to go?"}
          description={
            editing
              ? "Check the details, then save. Publish, cancel, or archive from the menu at the top."
              : "Check the details. Save as a draft to finish later, or publish it now."
          }
        >
          <ReviewChecklist values={values} selected={selected} />
          <ReviewSummary values={values} selected={selected} steps={steps} onEdit={goToStep} />
        </StepPanel>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border">
          <FormActions
            submitLabel="Save"
            sticky={false}
            hideSubmit
            guard={guard}
            destructive={
              <Button
                type="button"
                variant="outline"
                onClick={() => guard.requestLeave(cancelHref)}
              >
                {editing ? "Discard changes" : "Cancel"}
              </Button>
            }
          >
            {currentIndex > 0 ? (
              <Button type="button" variant="outline" onClick={() => void goTo(currentIndex - 1)}>
                <ArrowLeftIcon aria-hidden />
                Back
              </Button>
            ) : null}
            {!isLast ? (
              <Button
                type="button"
                variant={editing ? "outline" : "default"}
                onClick={() => void goTo(currentIndex + 1)}
              >
                Continue
                <ArrowRightIcon aria-hidden />
              </Button>
            ) : null}
            {editing || isLast ? (
              <Button
                type="button"
                variant={offerPublish && isLast ? "outline" : "default"}
                loading={form.formState.isSubmitting}
                disabled={form.formState.isSubmitting}
                onClick={() => submit("save")}
              >
                {editing ? "Save event" : "Save as draft"}
              </Button>
            ) : null}
            {isLast && offerPublish ? (
              <Button
                type="button"
                loading={form.formState.isSubmitting}
                disabled={form.formState.isSubmitting}
                onClick={() => submit("publish")}
              >
                Save and publish
              </Button>
            ) : null}
          </FormActions>
        </div>
      </div>

      <aside className="hidden xl:block xl:sticky xl:top-4 xl:self-start" aria-label="Preview">
        <div className="grid gap-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Customer preview
          </p>
          {preview}
          <p className="text-xs text-muted-foreground">Approximate. Updates as you type.</p>
        </div>
      </aside>

      {sessionDialog
        ? createPortal(
            // The session form is its own <form>. Portaled so the DOM does not nest forms, and
            // submit events stop here so they never reach the event form through the React tree.
            <div onSubmit={(event) => event.stopPropagation()}>
              <SessionFormPage
                sessionId={sessionDialog}
                surface="overlay"
                onClose={() => setSessionDialog(null)}
                onSaved={(session) => {
                  if (bound) return;
                  form.setValue("sessionId", session.id, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function SessionVenue({
  choice,
  onChange,
}: {
  choice: SessionChoice | null;
  onChange?: () => void;
}) {
  const venue = choice?.venue ?? null;
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <MapPinIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="grid min-w-0 gap-0.5 text-sm">
          {venue ? (
            <>
              <span className="flex flex-wrap items-center gap-2 font-medium">
                {venue.name}
                <Badge variant={venue.kind === "OFFSITE" ? "accent" : "neutral"}>
                  {venueKindLabel(venue.kind)}
                </Badge>
              </span>
              {venue.address ? (
                <span className="text-muted-foreground">{venue.address}</span>
              ) : null}
            </>
          ) : (
            <span className="text-muted-foreground">
              {choice ? "This session has no venue on file." : "Pick a session to see its venue."}
            </span>
          )}
        </div>
      </div>
      {onChange ? (
        <Button type="button" variant="outline" size="sm" onClick={onChange}>
          Change venue
        </Button>
      ) : null}
    </div>
  );
}

function StepPanel({
  active,
  title,
  description,
  children,
}: {
  active: boolean;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section hidden={!active} aria-label={title}>
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-7">
        <header className="grid gap-1.5">
          <h2 className="font-display text-2xl leading-tight md:text-3xl">{title}</h2>
          <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
        </header>
        {children}
      </div>
    </section>
  );
}

function SubSection({
  title,
  description,
  divided = false,
  children,
}: {
  title: string;
  description?: string;
  /** Rule above the section, for every section after the first. */
  divided?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-4", divided && "border-t border-border pt-5")}>
      <div className="grid gap-0.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function SessionChip({
  choice,
  editable,
  picking,
  onChange,
}: {
  choice: SessionChoice | null;
  editable: boolean;
  /** On the Session step itself, the picker below is the way to change it. */
  picking: boolean;
  onChange: () => void;
}) {
  if (!choice) {
    return <p className="text-sm text-muted-foreground">No session picked yet.</p>;
  }
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-card py-1.5 pr-2 pl-3 text-sm">
      <CalendarClockIcon aria-hidden className="size-4 shrink-0 text-primary" />
      <span className="min-w-0 truncate">
        <span className="font-medium">{choice.className}</span>
        <span className="text-muted-foreground">
          {" "}
          · {formatSessionDate(choice.startsAt)} ·{" "}
          {formatSessionTimeRange(choice.startsAt, choice.endsAt)}
        </span>
      </span>
      {editable ? (
        <Button type="button" variant="ghost" size="xs" onClick={onChange}>
          Change
        </Button>
      ) : picking ? null : (
        <Button
          nativeButton={false}
          variant="ghost"
          size="xs"
          render={<Link href={`/schedule/${choice.id}`} />}
        >
          Edit session
        </Button>
      )}
    </div>
  );
}

function CauseField() {
  const form = useAdminFormContext<EventFormValues>();
  const [on, setOn] = useState(() => form.getValues("beneficiary").trim().length > 0);
  const switchId = useId();

  return (
    <div className="grid gap-4 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-4">
        <label htmlFor={switchId} className="grid cursor-pointer gap-0.5">
          <span className="text-sm font-medium">This event supports a cause</span>
          <span className="text-sm text-muted-foreground">
            Name the beneficiary so it shows on the card.
          </span>
        </label>
        <Switch
          id={switchId}
          checked={on}
          onCheckedChange={(next) => {
            setOn(next);
            if (!next) {
              form.setValue("beneficiary", "", { shouldDirty: true });
              form.clearErrors("beneficiary");
            }
          }}
        />
      </div>
      {on ? (
        <FormField name="beneficiary" label="Beneficiary" maxLength={200}>
          {(field) => <TextBinding {...field} placeholder="Cebu Animal Rescue" />}
        </FormField>
      ) : null}
    </div>
  );
}

function RegistrationWindow() {
  const form = useAdminFormContext<EventFormValues>();
  const [custom, setCustom] = useState(() =>
    REGISTRATION_FIELDS.some((name) => form.getValues(name).trim().length > 0),
  );
  const modeName = useId();
  const [opensOn, opensAt, closesOn, closesAt] = form.watch([...REGISTRATION_FIELDS]);
  const opens = eventInstantFromParts(opensOn, opensAt);
  const closes = eventInstantFromParts(closesOn, closesAt);

  function followSession() {
    setCustom(false);
    for (const name of REGISTRATION_FIELDS) form.setValue(name, "", { shouldDirty: true });
    form.clearErrors([...REGISTRATION_FIELDS]);
  }

  return (
    <SubSection
      divided
      title="Registration"
      description="Optional. The session's booking cutoff always applies. Times are Asia/Manila."
    >
      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="sr-only">Registration window</legend>
        <ModeOption
          name={modeName}
          checked={!custom}
          title="Follow the session"
          body="Open whenever the session is bookable."
          onSelect={followSession}
        />
        <ModeOption
          name={modeName}
          checked={custom}
          title="Custom window"
          body="Set when registration opens and closes."
          onSelect={() => setCustom(true)}
        />
      </fieldset>
      {custom ? (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField name="registrationOpensOn" label="Opens on">
              {(field) => <DateBinding {...field} value={stringValue(field.value)} />}
            </FormField>
            <FormField name="registrationOpensAtTime" label="Opens at">
              {(field) => <TimeBinding {...field} value={stringValue(field.value)} />}
            </FormField>
            <FormField name="registrationClosesOn" label="Closes on">
              {(field) => <DateBinding {...field} value={stringValue(field.value)} />}
            </FormField>
            <FormField name="registrationClosesAtTime" label="Closes at">
              {(field) => <TimeBinding {...field} value={stringValue(field.value)} />}
            </FormField>
          </div>
          {opens || closes ? (
            <p className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              {registrationSentence(opens, closes)}
            </p>
          ) : null}
        </div>
      ) : null}
    </SubSection>
  );
}

function ModeOption({
  name,
  checked,
  title,
  body,
  onSelect,
}: {
  name: string;
  checked: boolean;
  title: string;
  body: string;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "relative grid cursor-pointer gap-0.5 rounded-xl border px-4 py-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
        checked
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/50",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="sr-only" />
      <span className="text-sm font-medium">{title}</span>
      <span className="text-sm text-muted-foreground">{body}</span>
    </label>
  );
}

function StaffNotes() {
  const form = useAdminFormContext<EventFormValues>();
  const [open, setOpen] = useState(() => form.getValues("internalNotes").trim().length > 0);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="grid gap-3 border-t border-border pt-5"
    >
      <CollapsibleTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold"
          />
        }
      >
        <span className="flex items-center gap-2">
          <LockIcon aria-hidden className="size-4 text-muted-foreground" />
          Staff notes
          <span className="font-normal text-muted-foreground">Customers never see these</span>
        </span>
        <ChevronDownIcon
          aria-hidden
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <FormField name="internalNotes" label="Internal notes" optional maxLength={4000}>
          {(field) => <TextareaBinding {...field} rows={4} />}
        </FormField>
      </CollapsibleContent>
    </Collapsible>
  );
}

type CheckTone = "ok" | "warn" | "block";

function ReviewChecklist({
  values,
  selected,
}: {
  values: EventFormValues;
  selected: SessionChoice | null;
}) {
  const items: { key: string; tone: CheckTone; label: ReactNode }[] = [];

  if (!selected) {
    items.push({ key: "session", tone: "block", label: "Pick a session before saving." });
  } else if (selected.status === "DRAFT") {
    items.push({
      key: "session",
      tone: "block",
      label: (
        <>
          {EVENT_CONFLICT_MESSAGES.event_publish_requires_published_session}{" "}
          <Link className="underline underline-offset-4" href={`/schedule/${selected.id}`}>
            Publish the session
          </Link>
        </>
      ),
    });
  } else if (selected.status === "CANCELLED") {
    items.push({
      key: "session",
      tone: "block",
      label: "This session is cancelled, so the event cannot be published.",
    });
  } else {
    items.push({ key: "session", tone: "ok", label: "Session is published" });
  }
  if (selected?.pricePlaceholder) {
    items.push({
      key: "price",
      tone: "warn",
      label: "This session price is a non-authoritative placeholder (OQ-PRICE).",
    });
  }
  items.push(
    values.title.trim()
      ? { key: "title", tone: "ok", label: "Title is set" }
      : { key: "title", tone: "block", label: "Add a title" },
  );
  items.push(
    values.summary.trim()
      ? { key: "summary", tone: "ok", label: "Summary is set" }
      : { key: "summary", tone: "warn", label: "No summary. Cards will show the title only." },
  );
  items.push(
    values.posterImage
      ? { key: "poster", tone: "ok", label: "Poster added" }
      : { key: "poster", tone: "warn", label: "No poster. Cards will use the fallback art." },
  );
  items.push(
    selected?.venue
      ? {
          key: "venue",
          tone: "ok",
          label: `Runs at ${selected.venue.name}${selected.venue.kind === "OFFSITE" ? " (off-site)" : ""}`,
        }
      : {
          key: "venue",
          tone: "warn",
          label: "No venue on the session. Customers will see “Venue to be announced”.",
        },
  );

  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li
          key={item.key}
          className={cn(
            "flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm",
            item.tone === "block" && "bg-destructive/10",
            item.tone === "warn" && "bg-muted/50",
          )}
        >
          {item.tone === "ok" ? (
            <CheckCircle2Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          ) : item.tone === "warn" ? (
            <AlertTriangleIcon
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
          ) : (
            <CircleSlashIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
          )}
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

function ReviewSummary({
  values,
  selected,
  steps,
  onEdit,
}: {
  values: EventFormValues;
  selected: SessionChoice | null;
  steps: readonly StepDef[];
  onEdit: (id: EventFormStepId) => void;
}) {
  const opens = eventInstantFromParts(values.registrationOpensOn, values.registrationOpensAtTime);
  const closes = eventInstantFromParts(
    values.registrationClosesOn,
    values.registrationClosesAtTime,
  );
  const rows: { step: EventFormStepId; label: string; value: string }[] = [
    {
      step: "session",
      label: "Session",
      value: selected
        ? `${selected.className} · ${formatSessionRange(selected.startsAt, selected.endsAt)} · ${selected.capacity} ${selected.capacity === 1 ? "spot" : "spots"} · ${selected.priceLabel}`
        : "—",
    },
    { step: "story", label: "Title", value: values.title.trim() || "—" },
    { step: "story", label: "Cause", value: values.beneficiary.trim() || "None" },
    {
      step: "look",
      label: "Media",
      value: `${values.posterImage ? "Poster" : "No poster"} · ${values.galleryImages.length} gallery ${values.galleryImages.length === 1 ? "image" : "images"}`,
    },
    {
      step: "session",
      label: "Venue",
      value: selected?.venue
        ? [selected.venue.name, selected.venue.address].filter(Boolean).join(", ")
        : "—",
    },
    {
      step: "logistics",
      label: "Registration",
      value: opens || closes ? registrationSentence(opens, closes) : "Follows the session",
    },
  ];
  const editable = new Set(steps.map((step) => step.id));

  return (
    <dl className="divide-y divide-border rounded-xl border border-border">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start gap-3 px-4 py-3 text-sm">
          <dt className="w-24 shrink-0 text-muted-foreground">{row.label}</dt>
          <dd className="min-w-0 flex-1 break-words">{row.value}</dd>
          {editable.has(row.step) ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={`Edit ${row.label.toLowerCase()}`}
              onClick={() => onEdit(row.step)}
            >
              <PencilIcon />
            </Button>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

function EventLifecycleActions({
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
  const sessionCancelled = choice.status === "CANCELLED";
  const canPublish =
    (event.status === "DRAFT" || event.status === "CANCELLED") && !sessionCancelled;
  const canCancel = event.status === "DRAFT" || event.status === "PUBLISHED";
  const canArchive = event.status !== "ARCHIVED";
  const sessionHref = `/schedule/${choice.id}`;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={event.status === "PUBLISHED" ? "success" : "neutral"}>
        {event.statusLabel}
      </Badge>
      {canPublish ? (
        <Button type="button" variant="outline" onClick={() => void onPublish()}>
          Publish event
        </Button>
      ) : null}
      {canCancel || canArchive ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline" size="icon" aria-label="More event actions" />
            }
          >
            <EllipsisIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {canCancel ? (
              <DropdownMenuItem onClick={() => setDialog("cancel")}>
                <CircleSlashIcon aria-hidden />
                Cancel event
              </DropdownMenuItem>
            ) : null}
            {canArchive ? (
              <DropdownMenuItem onClick={() => setDialog("archive")}>
                <ArchiveIcon aria-hidden />
                Archive event
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      <LifecycleDialog
        open={dialog === "cancel"}
        title="Cancel this event?"
        confirmLabel="Cancel event"
        sessionHref={sessionHref}
        onOpenChange={(open) => setDialog(open ? "cancel" : null)}
        onConfirm={() => {
          setDialog(null);
          void onCancel();
        }}
      >
        This cancels the event only. It does not cancel the session or its bookings, and it does not
        delete history. Cancel the session from the schedule when that is the real intent (admin
        flow F).
      </LifecycleDialog>
      <LifecycleDialog
        open={dialog === "archive"}
        title="Archive this event?"
        confirmLabel="Archive event"
        sessionHref={sessionHref}
        onOpenChange={(open) => setDialog(open ? "archive" : null)}
        onConfirm={() => {
          setDialog(null);
          void onArchive();
        }}
      >
        Archiving keeps the event on file and does not delete the session, its bookings, or history.
        It does not cancel the session. Cancel the session from the schedule when that is the real
        intent (admin flow F).
      </LifecycleDialog>
    </div>
  );
}

function LifecycleDialog({
  open,
  title,
  confirmLabel,
  sessionHref,
  onOpenChange,
  onConfirm,
  children,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  sessionHref: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  children: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function registrationSentence(opens: string | null, closes: string | null): string {
  const stamp = (iso: string) => `${formatSessionDate(iso)}, ${formatSessionTime(iso)}`;
  if (opens && closes) return `Registration opens ${stamp(opens)} and closes ${stamp(closes)}.`;
  if (opens) return `Registration opens ${stamp(opens)}.`;
  if (closes) return `Registration closes ${stamp(closes)}.`;
  return "";
}

function toWriteBody(values: EventFormValues) {
  return {
    sessionId: values.sessionId,
    title: values.title,
    summary: values.summary,
    description: values.description,
    posterImage: values.posterImage || null,
    galleryImages: values.galleryImages,
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
  venues: readonly AdminVenue[],
): SessionChoice[] {
  const liveIds = new Set(sessions.map((session) => session.id));
  const fromLive = sessions.map((session) =>
    choiceFromLive(session, events.find((event) => event.sessionId === session.id) ?? null, venues),
  );
  const fromEvents = events
    .filter((event) => !liveIds.has(event.sessionId))
    .map((event) => choiceFromEvent(event, classes));
  return [...fromLive, ...fromEvents].sort(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
  );
}

function choiceFromLive(
  session: AdminSession,
  event: AdminEvent | null,
  venues: readonly AdminVenue[],
): SessionChoice {
  const venue = venues.find((row) => row.id === session.venueId);
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
    venue: venue ? { name: venue.name, address: venue.address, kind: venue.kind } : null,
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
    venue: event.session.venue,
  };
}
