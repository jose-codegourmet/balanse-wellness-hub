"use client";

import {
  type AdminClass,
  type AdminCoach,
  type AdminSession,
  type AdminVenue,
  auditConfirmationCopy,
  formatPeso,
  formatSessionTime,
  isManilaYmd,
  manilaYmd,
  SESSION_SLOTS_MANILA,
  sessionDisplayName,
  sessionStatusLabel,
  venueKindLabel,
  type Weekday,
  weekdayForYmd,
} from "@balanse/domain";
import {
  Badge,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  FormPageSkeleton,
  Input,
} from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDaysIcon,
  DumbbellIcon,
  EyeIcon,
  MapPinIcon,
  MinusIcon,
  PlusIcon,
  RepeatIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminNowIso, adminTodayYmd } from "@/lib/clock";
import {
  useCancelAdminSession,
  useCreateAdminRecurringSchedule,
  useUpsertAdminSession,
} from "@/lib/query/mutations";
import {
  adminClassesQuery,
  adminCoachesQuery,
  adminSessionRosterQuery,
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
  BooleanBinding,
  DateBinding,
  TextBinding,
  TimeBinding,
} from "@/modules/admin/forms/bindings";
import {
  sessionFormDefaultValues,
  sessionFormValuesForDate,
  sessionFormValuesFromSession,
} from "@/modules/admin/forms/session/session-form.defaults";
import {
  fromSessionIso,
  makeSessionFormSchema,
  type SessionFormValues,
  toSessionIso,
} from "@/modules/admin/forms/session/session-form.schema";
import { useUnsavedChangesGuard } from "@/modules/admin/forms/useUnsavedChangesGuard";
import { useCanAdminAction } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { occurrenceWillBeSkipped, planOccurrences } from "../../_lib/session-occurrences";
import { RepeatPicker } from "../repeat-picker/RepeatPicker";
import { ClassTilePicker } from "./class-tile-picker/ClassTilePicker";
import { CoachTilePicker } from "./coach-tile-picker/CoachTilePicker";
import type { SessionFormPageProps } from "./SessionFormPage.schema";
import { SessionSummaryPanel } from "./session-summary-panel/SessionSummaryPanel";

const CLOSE_HREF = "/schedule";
const SESSION_FORM_ID = "session-form";
const DEFAULT_START = SESSION_SLOTS_MANILA[0];
const DEFAULT_DURATION = 60;
const DURATION_CHIPS = [45, 60, 75, 90, 120] as const;

export function SessionFormPage({
  sessionId,
  date,
  surface = "page",
  onSaved,
  onClose,
}: SessionFormPageProps) {
  const isNew = sessionId === "new";
  const { principal } = useMockPrincipal();
  const canSeeRates = useCanAdminAction("coach-rates-read");
  const canCancelSession = useCanAdminAction("schedule-cancel");
  const classesQuery = useQuery(adminClassesQuery(principal));
  const coachesQuery = useQuery(adminCoachesQuery(principal));
  const sessionsQuery = useQuery(adminSessionsQuery(principal));
  const venuesQuery = useQuery(adminVenuesQuery(principal));
  const rosterQuery = useQuery({
    ...adminSessionRosterQuery(principal, sessionId),
    enabled: !isNew,
  });
  const upsert = useUpsertAdminSession();
  const createSeries = useCreateAdminRecurringSchedule();
  const router = useRouter();
  const requestCloseRef = useRef<(() => void) | null>(null);

  const classes = classesQuery.data ?? [];
  const coaches = coachesQuery.data ?? [];
  const venues = venuesQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];
  const existing = isNew ? undefined : sessions.find((row) => row.id === sessionId);
  const ymd = isManilaYmd(date) ? date : adminTodayYmd();
  const consumed = isNew
    ? 0
    : (rosterQuery.data?.confirmedCount ?? 0) + (rosterQuery.data?.heldCount ?? 0);

  function leaveList() {
    if (onClose) {
      onClose();
      return;
    }
    if (surface === "overlay") {
      router.back();
      return;
    }
    router.push(CLOSE_HREF);
  }

  const title = isNew ? "New session" : "Edit session";
  const description = isNew
    ? "Pick a class, a time, and a place. Repeat it weekly if it's a regular slot."
    : existing
      ? `${sessionDisplayName(existing)} · ${sessionStatusLabel(existing.status)}`
      : undefined;

  const listsPending =
    (classesQuery.isPending && !classesQuery.data) ||
    (coachesQuery.isPending && !coachesQuery.data) ||
    (venuesQuery.isPending && !venuesQuery.data) ||
    (!isNew && sessionsQuery.isPending && !sessionsQuery.data) ||
    (!isNew && rosterQuery.isPending && !rosterQuery.data);

  async function createRepeats(saved: AdminSession, values: SessionFormValues) {
    const weekdays = values.repeatWeekdays.map(Number) as Weekday[];
    const firstYmd = manilaYmd(values.startsAt);
    try {
      const result = await createSeries.mutateAsync({
        sourceSessionId: saved.id,
        startsOn: firstYmd,
        endsOn: values.repeatEndsOn,
        weekdays,
        publish: values.status === "PUBLISHED",
      });
      // The first session sits on its own weekday, so the generator skips it as a match.
      const alreadyThere =
        result.skippedCount - (weekdays.includes(weekdayForYmd(firstYmd)) ? 1 : 0);
      const total = result.createdCount + 1;
      notify.success({
        title: `${total} ${total === 1 ? "session" : "sessions"} scheduled`,
        description:
          alreadyThere > 0
            ? `${alreadyThere} ${alreadyThere === 1 ? "date was" : "dates were"} already on the schedule and skipped.`
            : "The weekly series is on the schedule.",
      });
    } catch (error) {
      notify.error({
        title: "Only the first session was created",
        description:
          `The weekly repeats could not be added. ${error instanceof Error ? error.message : ""}`.trim(),
      });
    }
  }

  const body = listsPending ? (
    <div className="p-6">
      <FormPageSkeleton label="Loading session" sections={3} fields={8} />
    </div>
  ) : (
    <AdminForm
      id={SESSION_FORM_ID}
      key={`${existing?.id ?? (isNew ? `new-${ymd}` : `pending-${sessionId}`)}:${consumed}:${canSeeRates ? "admin" : "staff"}`}
      className={cn(
        surface === "overlay" &&
          "flex min-h-0 flex-1 flex-col [&>fieldset>[data-slot=field-group]]:min-h-0 [&>fieldset>[data-slot=field-group]]:flex-1 [&>fieldset>[data-slot=field-group]]:gap-0",
      )}
      schema={makeSessionFormSchema({ consumed })}
      defaultValues={
        existing
          ? sessionFormValuesFromSession(existing)
          : defaultsForCreate(
              ymd,
              classes.filter((row) => row.active),
              defaultVenueId(venues),
            )
      }
      onSubmit={async (values) => {
        let saved: AdminSession;
        try {
          saved = await upsert.mutateAsync({
            id: isNew ? undefined : sessionId,
            classId: values.classId,
            venueId: values.venueId,
            name: values.name || null,
            coachIds: values.coachIds,
            startsAt: values.startsAt,
            endsAt: values.endsAt,
            pricePhp: values.pricePhp,
            capacity: values.capacity,
            bookable: values.bookable,
            status: values.status,
          });
        } catch (error) {
          notify.admin("session.save-failed");
          throw error;
        }
        if (isNew && values.repeat === "weekly") {
          await createRepeats(saved, values);
        } else {
          notify.admin("session.saved");
        }
        onSaved?.(saved);
        leaveList();
      }}
    >
      <SessionComposer
        isNew={isNew}
        existing={existing}
        classes={classes.filter((row) => row.active || row.id === existing?.classId)}
        coaches={coaches.filter(
          (coach) => coach.active || existing?.coaches.some((row) => row.id === coach.id),
        )}
        venues={venues.filter((row) => row.active || row.id === existing?.venueId)}
        sessions={sessions}
        assignments={existing?.coachAssignments ?? []}
        canSeeRates={canSeeRates}
        canCancel={!isNew && existing?.status !== "CANCELLED" && canCancelSession}
        surface={surface}
        onLeaveList={leaveList}
        requestCloseRef={requestCloseRef}
      />
    </AdminForm>
  );

  if (surface === "overlay") {
    return (
      <Dialog
        open
        onOpenChange={(open) => {
          if (open) return;
          if (requestCloseRef.current) requestCloseRef.current();
          else leaveList();
        }}
      >
        <DialogContent
          showCloseButton
          className="flex h-[min(94dvh,60rem)] w-[min(96vw,76rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none max-sm:h-dvh max-sm:w-screen max-sm:max-w-none max-sm:rounded-none"
        >
          <header className="shrink-0 border-b border-border px-5 py-4 md:px-7">
            <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
            {description ? (
              <DialogDescription className="mt-0.5">{description}</DialogDescription>
            ) : null}
          </header>
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <AdminPageShell
      className="overflow-x-clip"
      eyebrow="Schedule"
      title={title}
      description={description}
      breadcrumb={[
        { label: "Schedule", href: CLOSE_HREF },
        { label: isNew ? "New session" : existing ? sessionDisplayName(existing) : sessionId },
      ]}
    >
      {body}
    </AdminPageShell>
  );
}

/** New sessions default to the first active branch (the main studio in fixtures). */
function defaultVenueId(venues: readonly AdminVenue[]): string {
  const active = venues.filter((row) => row.active);
  return (active.find((row) => row.kind === "BRANCH") ?? active[0])?.id ?? "";
}

function defaultsForCreate(ymd: string, classes: AdminClass[], venueId: string): SessionFormValues {
  const klass = classes[0];
  const start = DEFAULT_START;
  return {
    ...sessionFormValuesForDate(ymd),
    classId: klass?.id ?? "",
    venueId,
    coachIds: [],
    capacity: 12,
    startsAt: toSessionIso(ymd, start),
    endsAt: toSessionIso(
      ymd,
      addMinutesHhmm(start, klass?.defaultDurationMinutes ?? DEFAULT_DURATION),
    ),
    pricePhp: klass?.defaultPricePhp ?? sessionFormDefaultValues.pricePhp,
  };
}

function addMinutesHhmm(hhmm: string, minutes: number): string {
  const [hour, minute] = hhmm.split(":").map(Number);
  const total = (((hour * 60 + minute + minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function durationMinutes(startsAt: string, endsAt: string): number | null {
  const minutes = (Date.parse(endsAt) - Date.parse(startsAt)) / 60_000;
  return Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : null;
}

function SessionComposer({
  isNew,
  existing,
  classes,
  coaches,
  venues,
  sessions,
  assignments,
  canSeeRates,
  canCancel,
  surface,
  onLeaveList,
  requestCloseRef,
}: {
  isNew: boolean;
  existing?: AdminSession;
  classes: AdminClass[];
  coaches: AdminCoach[];
  venues: AdminVenue[];
  sessions: AdminSession[];
  assignments: AdminSession["coachAssignments"];
  canSeeRates: boolean;
  canCancel: boolean;
  surface: "overlay" | "page";
  onLeaveList: () => void;
  requestCloseRef: React.MutableRefObject<(() => void) | null>;
}) {
  const form = useAdminFormContext<SessionFormValues>();
  const router = useRouter();
  const cancel = useCancelAdminSession();
  const guard = useUnsavedChangesGuard(form.formState.isDirty, (href) => {
    if (href === CLOSE_HREF) {
      onLeaveList();
      return;
    }
    router.push(href);
  });
  useEffect(() => {
    requestCloseRef.current = () => guard.requestLeave(CLOSE_HREF);
  });

  const values = form.watch();
  const { errors } = form.formState;
  const klass = classes.find((row) => row.id === values.classId);
  const venue = venues.find((row) => row.id === values.venueId) ?? null;
  const chosenCoaches = values.coachIds
    .map((id) => coaches.find((coach) => coach.id === id))
    .filter((coach): coach is AdminCoach => Boolean(coach));

  const occurrences = planOccurrences(
    {
      startsAt: values.startsAt,
      endsAt: values.endsAt,
      repeat:
        isNew && values.repeat === "weekly"
          ? {
              weekdays: values.repeatWeekdays.map(Number) as Weekday[],
              endsOn: values.repeatEndsOn,
            }
          : null,
    },
    {
      sessions,
      classId: values.classId,
      coachIds: values.coachIds,
      ignoreSessionId: existing?.id,
    },
  );

  // Coaches already teaching at the first date's time (shown on their tiles).
  const busyCoaches = (() => {
    const busy = new Map<string, string>();
    const first = occurrences[0];
    if (!first) return busy;
    for (const session of sessions) {
      if (session.id === existing?.id || session.status === "CANCELLED") continue;
      const overlaps =
        Date.parse(session.startsAt) < Date.parse(first.endsAt) &&
        Date.parse(first.startsAt) < Date.parse(session.endsAt);
      if (!overlaps) continue;
      for (const coach of session.coaches) {
        if (!busy.has(coach.id)) {
          busy.set(
            coach.id,
            `${sessionDisplayName(session)} at ${formatSessionTime(session.startsAt)}`,
          );
        }
      }
    }
    return busy;
  })();

  const creating = occurrences.filter((row) => !occurrenceWillBeSkipped(row)).length;
  const submitLabel = !isNew
    ? "Save changes"
    : values.repeat === "weekly" && creating > 1
      ? `Create ${creating} sessions`
      : "Create session";

  function applyClassDefaults(classId: string) {
    const next = classes.find((row) => row.id === classId);
    if (!next) return;
    if (next.defaultPricePhp != null) {
      form.setValue("pricePhp", next.defaultPricePhp, { shouldDirty: true });
    }
    if (isNew && next.defaultDurationMinutes != null && values.startsAt) {
      const { ymd, hhmm } = fromSessionIso(values.startsAt);
      form.setValue(
        "endsAt",
        toSessionIso(ymd, addMinutesHhmm(hhmm, next.defaultDurationMinutes)),
        {
          shouldDirty: true,
        },
      );
    }
  }

  const rateLines = canSeeRates
    ? chosenCoaches.map((coach) => {
        const saved = assignments.find((row) => row.coachId === coach.id);
        const rate = saved?.coachRatePhp ?? coach.defaultRatePhp;
        const type = saved?.coachRateType ?? coach.rateType;
        return {
          coachName: coach.name,
          label: `${formatPeso(rate)} / ${type === "PER_HOUR" ? "hour" : "session"}`,
          note: saved ? "Saved rate" : "Current default, captured on save",
        };
      })
    : undefined;

  const overlay = surface === "overlay";

  return (
    <>
      <div
        className={cn(
          "grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start",
          overlay && "min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-7",
        )}
      >
        <div className="grid min-w-0 gap-4">
          <ComposerSection
            icon={DumbbellIcon}
            title="What"
            hint="The class sets the default length and price."
          >
            <FormField name="classId" label="Class" required>
              {(field) => (
                <ClassTilePicker
                  classes={classes}
                  value={String(field.value ?? "")}
                  invalid={"classId" in errors}
                  onChange={(classId) => {
                    field.onChange(classId);
                    applyClassDefaults(classId);
                  }}
                />
              )}
            </FormField>
            <FormField
              name="name"
              label="Session name"
              optional
              description="Leave blank to use the class name. This does not rename the class."
            >
              {(field) => <TextBinding {...field} placeholder={klass?.name ?? "Class name"} />}
            </FormField>
          </ComposerSection>

          <ComposerSection icon={CalendarDaysIcon} title="When" hint="Times are Asia/Manila.">
            <SessionTimeFields
              defaultDuration={klass?.defaultDurationMinutes ?? DEFAULT_DURATION}
            />
          </ComposerSection>

          {isNew ? (
            <ComposerSection
              icon={RepeatIcon}
              title="Repeat"
              hint="Each repeat is its own session with its own bookings. Nothing is copied from past bookings."
            >
              <RepeatPicker
                anchorYmd={values.startsAt ? manilaYmd(values.startsAt) : ""}
                today={adminTodayYmd()}
                value={{
                  mode: values.repeat,
                  weekdays: values.repeatWeekdays.map(Number) as Weekday[],
                  endsOn: values.repeatEndsOn,
                }}
                errors={{
                  weekdays: errors.repeatWeekdays?.message,
                  endsOn: errors.repeatEndsOn?.message,
                }}
                onChange={(next) => {
                  const options = { shouldDirty: true, shouldValidate: form.formState.isSubmitted };
                  form.setValue("repeat", next.mode, options);
                  form.setValue("repeatWeekdays", next.weekdays.map(String), options);
                  form.setValue("repeatEndsOn", next.endsOn, options);
                }}
              />
            </ComposerSection>
          ) : existing?.recurrenceRuleId ? (
            <p className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
              <RepeatIcon aria-hidden className="size-4 text-muted-foreground" />
              Part of a weekly series. Changes here apply to this date only.
            </p>
          ) : null}

          <ComposerSection
            icon={MapPinIcon}
            title="Where"
            hint="Sessions can share a time and a venue. How you use the space is up to you."
          >
            <FormField name="venueId" label="Venue" required>
              {(field) => (
                <VenueCards
                  venues={venues}
                  value={String(field.value ?? "")}
                  onChange={(id) => field.onChange(id)}
                />
              )}
            </FormField>
          </ComposerSection>

          <ComposerSection icon={UsersIcon} title="Who" hint="Choose at least one coach.">
            <FormField name="coachIds" label="Coaches" required>
              {(field) => (
                <CoachTilePicker
                  coaches={coaches}
                  value={Array.isArray(field.value) ? (field.value as string[]) : []}
                  recommendedIds={klass?.coachIds ?? []}
                  busy={busyCoaches}
                  invalid={"coachIds" in errors}
                  onChange={(ids) => field.onChange(ids)}
                />
              )}
            </FormField>
          </ComposerSection>

          <ComposerSection icon={TicketIcon} title="Seats and price">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField name="capacity" label="Capacity">
                {(field) => (
                  <CapacityStepper
                    value={Number(field.value) || 0}
                    onChange={(next) => field.onChange(next)}
                  />
                )}
              </FormField>
              <div className="grid gap-1.5">
                <FormField
                  name="pricePhp"
                  label="Price per person"
                  description={
                    klass?.defaultPricePhp != null
                      ? `Class default ${formatPeso(klass.defaultPricePhp)}`
                      : undefined
                  }
                >
                  {(field) => <TextBinding {...field} type="number" inputMode="numeric" />}
                </FormField>
                {klass?.defaultPricePhp != null &&
                klass.defaultPricePhp !== Number(values.pricePhp) ? (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="justify-self-start"
                    onClick={() =>
                      form.setValue("pricePhp", klass.defaultPricePhp ?? 0, { shouldDirty: true })
                    }
                  >
                    Reset to class default
                  </Button>
                ) : null}
              </div>
            </div>
          </ComposerSection>

          <ComposerSection icon={EyeIcon} title="Visibility">
            <VisibilityFields />
          </ComposerSection>
        </div>

        <aside className="lg:sticky lg:top-0">
          <SessionSummaryPanel
            gymClassName={klass?.name ?? ""}
            heroImage={klass?.heroImage ?? null}
            sessionName={values.name}
            startsAt={values.startsAt}
            endsAt={values.endsAt}
            venue={venue}
            coachNames={chosenCoaches.map((coach) => coach.name)}
            capacity={Number(values.capacity) || 0}
            pricePhp={Number(values.pricePhp) || 0}
            status={values.status}
            bookable={values.bookable}
            occurrences={occurrences}
            rateLines={rateLines}
            editing={!isNew}
          />
        </aside>
      </div>

      <FormActions
        formId={SESSION_FORM_ID}
        submitLabel={submitLabel}
        cancelHref={CLOSE_HREF}
        cancelLabel={isNew ? "Cancel" : "Close"}
        guard={guard}
        sticky={false}
        className={cn(
          "border-t border-border bg-background/95 py-3 backdrop-blur",
          overlay
            ? "shrink-0 px-5 md:px-7"
            : "sticky bottom-0 z-10 -mx-4 px-4 md:mx-0 md:rounded-xl md:border md:px-4",
        )}
        destructive={
          canCancel && existing ? (
            <ConfirmAction
              triggerLabel="Cancel session"
              title="Cancel this session?"
              description={`${auditConfirmationCopy("Cancel session", "Admin", adminNowIso())} Affected bookings enter manual refund handling. The session stays in history.`}
              variant="destructive"
              onConfirm={async () => {
                try {
                  await cancel.mutateAsync(existing.id);
                  notify.admin("session.cancelled");
                  onLeaveList();
                } catch {
                  notify.admin("session.cancel-failed");
                }
              }}
            />
          ) : null
        }
      />
    </>
  );
}

function ComposerSection({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: typeof DumbbellIcon;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-4 md:p-5">
      <header className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon aria-hidden className="size-4" />
        </span>
        <span className="grid gap-0.5">
          <h2 className="font-display text-xl leading-tight">{title}</h2>
          {hint ? <span className="text-sm text-muted-foreground">{hint}</span> : null}
        </span>
      </header>
      {children}
    </section>
  );
}

function SessionTimeFields({ defaultDuration }: { defaultDuration: number }) {
  const form = useAdminFormContext<SessionFormValues>();
  const startsAt = form.watch("startsAt");
  const endsAt = form.watch("endsAt");
  const start = startsAt ? fromSessionIso(startsAt) : { ymd: "", hhmm: "" };
  const minutes = durationMinutes(startsAt, endsAt) ?? defaultDuration;
  const options = { shouldDirty: true, shouldValidate: form.formState.isSubmitted };

  function setStart(ymd: string, hhmm: string) {
    if (!ymd || !hhmm) {
      form.setValue("startsAt", "", options);
      return;
    }
    form.setValue("startsAt", toSessionIso(ymd, hhmm), options);
    form.setValue("endsAt", toSessionIso(ymd, addMinutesHhmm(hhmm, minutes)), options);
  }

  function setDuration(next: number) {
    if (!start.ymd || !start.hhmm || next <= 0) return;
    form.setValue("endsAt", toSessionIso(start.ymd, addMinutesHhmm(start.hhmm, next)), options);
  }

  const custom = !(SESSION_SLOTS_MANILA as readonly string[]).includes(start.hhmm);

  return (
    <div className="grid gap-5">
      <FormField name="startsAt" label="Date" wireAria>
        {(field) => (
          <DateBinding
            {...field}
            today={adminTodayYmd()}
            value={start.ymd}
            onChange={(next) => setStart(String(next ?? ""), start.hhmm || DEFAULT_START)}
          />
        )}
      </FormField>
      <FormField name="startsAt" label="Starts at">
        {(field) => (
          <div className="grid gap-2">
            <div className="flex flex-wrap gap-1.5">
              {SESSION_SLOTS_MANILA.map((slot) => (
                <Chip
                  key={slot}
                  selected={start.hhmm === slot}
                  onClick={() => setStart(start.ymd || adminTodayYmd(), slot)}
                >
                  {formatSlot(slot)}
                </Chip>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {custom && start.hhmm ? "Custom time" : "Or another time"}
              </span>
              <div className="w-36">
                <TimeBinding
                  {...field}
                  value={start.hhmm}
                  onChange={(next) => setStart(start.ymd || adminTodayYmd(), String(next ?? ""))}
                />
              </div>
            </div>
          </div>
        )}
      </FormField>
      <FormField name="endsAt" label="Length">
        {() => (
          <div className="flex flex-wrap items-center gap-1.5">
            {DURATION_CHIPS.map((chip) => (
              <Chip key={chip} selected={minutes === chip} onClick={() => setDuration(chip)}>
                {formatLength(chip)}
              </Chip>
            ))}
            <Input
              aria-label="Length in minutes"
              invalid={false}
              type="number"
              min={15}
              step={15}
              className="w-24"
              value={minutes}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
            <span className="text-sm text-muted-foreground">
              min{endsAt ? ` · ends ${formatSessionTime(endsAt)}` : ""}
            </span>
          </div>
        )}
      </FormField>
    </div>
  );
}

function VenueCards({
  venues,
  value,
  onChange,
}: {
  venues: AdminVenue[];
  value: string;
  onChange: (id: string) => void;
}) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label="Venue" className="grid gap-2 sm:grid-cols-2">
      {venues.map((venue) => {
        const checked = venue.id === value;
        return (
          <label
            key={venue.id}
            className={cn(
              "relative flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
              checked
                ? "border-primary ring-1 ring-primary"
                : "border-border hover:border-primary/50",
            )}
          >
            <input
              type="radio"
              name={name}
              value={venue.id}
              checked={checked}
              onChange={() => onChange(venue.id)}
              className="sr-only"
            />
            <MapPinIcon
              aria-hidden
              className={cn(
                "mt-0.5 size-4 shrink-0",
                checked ? "text-primary" : "text-muted-foreground",
              )}
            />
            <span className="grid min-w-0 gap-0.5">
              <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                <span className="truncate">{venue.name}</span>
                <Badge variant={venue.kind === "OFFSITE" ? "accent" : "neutral"} size="sm">
                  {venueKindLabel(venue.kind)}
                </Badge>
                {venue.active ? null : (
                  <Badge variant="danger" size="sm">
                    Inactive
                  </Badge>
                )}
              </span>
              {venue.address ? (
                <span className="truncate text-xs text-muted-foreground">{venue.address}</span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function CapacityStepper({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Fewer spots"
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <MinusIcon />
      </Button>
      <Input
        aria-label="Capacity"
        type="number"
        min={1}
        className="w-20 shrink-0 text-center tabular-nums"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="More spots"
        onClick={() => onChange(value + 1)}
      >
        <PlusIcon />
      </Button>
      <span className="text-sm text-muted-foreground">spots</span>
    </div>
  );
}

function VisibilityFields() {
  const form = useAdminFormContext<SessionFormValues>();
  const status = form.watch("status");
  const name = useId();

  if (status === "CANCELLED") {
    return (
      <p className="text-sm text-muted-foreground">
        This session is cancelled. It stays in history and cannot be republished here.
      </p>
    );
  }

  const choices = [
    { value: "DRAFT", title: "Draft", body: "Hidden from customers while you finish it." },
    { value: "PUBLISHED", title: "Published", body: "On the public schedule." },
  ] as const;

  return (
    <div className="grid gap-4">
      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="sr-only">Status</legend>
        {choices.map((choice) => {
          const checked = status === choice.value;
          return (
            <label
              key={choice.value}
              className={cn(
                "relative grid cursor-pointer gap-0.5 rounded-xl border px-4 py-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
                checked
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50",
              )}
            >
              <input
                type="radio"
                name={name}
                checked={checked}
                onChange={() => form.setValue("status", choice.value, { shouldDirty: true })}
                className="sr-only"
              />
              <span className="text-sm font-medium">{choice.title}</span>
              <span className="text-sm text-muted-foreground">{choice.body}</span>
            </label>
          );
        })}
      </fieldset>
      {status === "PUBLISHED" ? (
        <FormField
          name="bookable"
          label="Accept bookings"
          orientation="horizontal"
          description="Turn off to show the session without letting customers book it yet."
        >
          {(field) => <BooleanBinding {...field} as="switch" />}
        </FormField>
      ) : null}
    </div>
  );
}

function formatLength(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest}`;
}

function formatSlot(hhmm: string): string {
  const [hour, minute] = hhmm.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0
    ? `${display} ${suffix}`
    : `${display}:${String(minute).padStart(2, "0")} ${suffix}`;
}
