"use client";

import {
  type AdminSession,
  formatPeso,
  formatSessionDate,
  formatSessionTimeRange,
  sessionDisplayName,
  type Weekday,
} from "@balanse/domain";
import { Button, FeedbackState } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPinIcon, RepeatIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo } from "react";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminTodayYmd } from "@/lib/clock";
import { useCreateAdminRecurringSchedule } from "@/lib/query/mutations";
import { adminSessionsQuery, adminVenuesQuery } from "@/lib/query/queries";
import { cn } from "@/lib/utils";
import {
  AdminForm,
  FormActions,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { occurrenceWillBeSkipped, planOccurrences } from "../../_lib/session-occurrences";
import { OccurrencePreview } from "../occurrence-preview/OccurrencePreview";
import { RepeatPicker } from "../repeat-picker/RepeatPicker";
import { recurringScheduleFormDefaultValues } from "./RecurringScheduleForm.defaults";
import type { RecurringScheduleFormProps } from "./RecurringScheduleForm.meta";
import {
  type RecurringScheduleFormValues,
  recurringScheduleFormSchema,
} from "./RecurringScheduleForm.schema";

const FORM_ID = "recurring-schedule-form";

export function RecurringScheduleForm({ sessionId }: RecurringScheduleFormProps) {
  const { principal } = useMockPrincipal();
  const sessions = useSuspenseQuery(adminSessionsQuery(principal)).data;
  const venues = useSuspenseQuery(adminVenuesQuery(principal)).data;
  const source = sessions.find((session) => session.id === sessionId);
  const createRecurring = useCreateAdminRecurringSchedule();
  const router = useRouter();

  if (!source) {
    return (
      <AdminPageShell title="Repeat weekly" breadcrumb={[{ label: "Schedule", href: "/schedule" }]}>
        <FeedbackState id="admin.no-sessions" />
      </AdminPageShell>
    );
  }

  if (source.status === "CANCELLED" || source.recurrenceRuleId) {
    const cancelled = source.status === "CANCELLED";
    return (
      <AdminPageShell title="Repeat weekly" breadcrumb={[{ label: "Schedule", href: "/schedule" }]}>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">
            {cancelled ? "This session cannot repeat" : "This session already repeats"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {cancelled
              ? "Cancelled sessions stay in history and cannot become templates."
              : "It is already part of a weekly series. Pick another session to start a new series."}
          </p>
          <Button className="mt-5" nativeButton={false} render={<Link href="/schedule" />}>
            Back to schedule
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  const venue = venues.find((row) => row.id === source.venueId);

  return (
    <AdminPageShell
      className="overflow-x-clip"
      eyebrow="Schedule"
      title="Repeat weekly"
      description="Copy this session onto the same time on the days you choose. Each copy is its own session with its own bookings."
      breadcrumb={[{ label: "Schedule", href: "/schedule" }, { label: "Repeat weekly" }]}
    >
      <AdminForm
        id={FORM_ID}
        schema={recurringScheduleFormSchema}
        defaultValues={recurringScheduleFormDefaultValues(source)}
        onSubmit={async (values) => {
          try {
            const result = await createRecurring.mutateAsync({
              sourceSessionId: source.id,
              startsOn: values.startsOn,
              endsOn: values.endsOn,
              weekdays: values.weekdays.map(Number) as Weekday[],
              publish: values.publish,
            });
            notify.success({
              title: `${result.createdCount} ${result.createdCount === 1 ? "session" : "sessions"} added`,
              description:
                result.skippedCount > 0
                  ? `${result.skippedCount} ${result.skippedCount === 1 ? "date was" : "dates were"} already on the schedule and skipped.`
                  : "The weekly series is on the schedule.",
            });
            router.push("/schedule");
          } catch (error) {
            notify.error({
              title: "The series could not be created",
              description: error instanceof Error ? error.message : String(error),
            });
            throw error;
          }
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="grid min-w-0 gap-4">
            <TemplateCard session={source} venueName={venue?.name} />
            <section className="grid gap-4 rounded-2xl border border-border bg-card p-4 md:p-5">
              <header className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <RepeatIcon aria-hidden className="size-4" />
                </span>
                <span className="grid gap-0.5">
                  <h2 className="font-display text-xl leading-tight">Pattern</h2>
                  <span className="text-sm text-muted-foreground">
                    Weekly, in Asia/Manila time. Holidays are not skipped automatically.
                  </span>
                </span>
              </header>
              <PatternFields anchorYmd={recurringScheduleFormDefaultValues(source).startsOn} />
            </section>
            <section className="grid gap-4 rounded-2xl border border-border bg-card p-4 md:p-5">
              <h2 className="font-display text-xl leading-tight">New sessions start as</h2>
              <PublishChoice />
            </section>
          </div>
          <aside className="lg:sticky lg:top-4">
            <SeriesPreview source={source} />
          </aside>
        </div>
        <FormActions
          submitLabel="Create series"
          cancelHref="/schedule"
          formId={FORM_ID}
          sticky={false}
          className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border"
        />
      </AdminForm>
    </AdminPageShell>
  );
}

function TemplateCard({ session, venueName }: { session: AdminSession; venueName?: string }) {
  return (
    <section className="grid gap-2 rounded-2xl border border-border bg-card p-4 md:p-5">
      <p className="text-[0.625rem] font-semibold tracking-[0.18em] text-primary uppercase">
        Repeating
      </p>
      <h2 className="font-display text-2xl leading-tight">{sessionDisplayName(session)}</h2>
      <p className="text-sm text-muted-foreground">
        {formatSessionDate(session.startsAt)} ·{" "}
        {formatSessionTimeRange(session.startsAt, session.endsAt)}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5">
          <UsersIcon aria-hidden className="size-4 text-muted-foreground" />
          {session.coachName}
        </span>
        {venueName ? (
          <span className="flex items-center gap-1.5">
            <MapPinIcon aria-hidden className="size-4 text-muted-foreground" />
            {venueName}
          </span>
        ) : null}
        <span>
          {formatPeso(session.pricePhp)} · {session.capacity} spots
        </span>
      </div>
    </section>
  );
}

function PatternFields({ anchorYmd }: { anchorYmd: string }) {
  const form = useAdminFormContext<RecurringScheduleFormValues>();
  const weekdays = form.watch("weekdays");
  const endsOn = form.watch("endsOn");
  const { errors, isSubmitted } = form.formState;

  return (
    <RepeatPicker
      allowNone={false}
      anchorYmd={anchorYmd}
      today={adminTodayYmd()}
      value={{ mode: "weekly", weekdays: weekdays.map(Number) as Weekday[], endsOn }}
      errors={{ weekdays: errors.weekdays?.message, endsOn: errors.endsOn?.message }}
      onChange={(next) => {
        const options = { shouldDirty: true, shouldValidate: isSubmitted };
        form.setValue("weekdays", next.weekdays.map(String), options);
        form.setValue("endsOn", next.endsOn, options);
      }}
    />
  );
}

function PublishChoice() {
  const form = useAdminFormContext<RecurringScheduleFormValues>();
  const publish = form.watch("publish");
  const name = useId();
  const choices = [
    { value: false, title: "Drafts", body: "Review each date before customers can see it." },
    { value: true, title: "Published", body: "Bookable right away on the public schedule." },
  ];
  return (
    <fieldset className="grid gap-2 sm:grid-cols-2">
      <legend className="sr-only">New sessions start as</legend>
      {choices.map((choice) => {
        const checked = publish === choice.value;
        return (
          <label
            key={choice.title}
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
              onChange={() => form.setValue("publish", choice.value, { shouldDirty: true })}
              className="sr-only"
            />
            <span className="text-sm font-medium">{choice.title}</span>
            <span className="text-sm text-muted-foreground">{choice.body}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

function SeriesPreview({ source }: { source: AdminSession }) {
  const form = useAdminFormContext<RecurringScheduleFormValues>();
  const { principal } = useMockPrincipal();
  const sessions = useSuspenseQuery(adminSessionsQuery(principal)).data;
  const weekdays = form.watch("weekdays");
  const endsOn = form.watch("endsOn");
  const occurrences = useMemo(
    () =>
      planOccurrences(
        {
          startsAt: source.startsAt,
          endsAt: source.endsAt,
          repeat: { weekdays: weekdays.map(Number) as Weekday[], endsOn },
        },
        {
          sessions,
          classId: source.classId,
          coachIds: source.coaches.map((coach) => coach.id),
          ignoreSessionId: source.id,
        },
      ),
    [endsOn, sessions, source, weekdays],
  );
  const adding = occurrences.filter((row) => !row.isFirst && !occurrenceWillBeSkipped(row)).length;

  return (
    <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-0.5">
        <p className="font-display text-3xl tabular-nums">{adding}</p>
        <p className="text-sm text-muted-foreground">
          new {adding === 1 ? "session" : "sessions"} after the original
        </p>
      </div>
      <OccurrencePreview occurrences={occurrences} />
    </section>
  );
}
