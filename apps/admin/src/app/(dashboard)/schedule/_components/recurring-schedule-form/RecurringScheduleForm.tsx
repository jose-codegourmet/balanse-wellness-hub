"use client";

import {
  type AdminSession,
  datesForWeeklyRecurrence,
  formatPeso,
  formatSessionDate,
  formatSessionTime,
  isManilaYmd,
  sessionDisplayName,
  WEEKDAYS,
  type Weekday,
} from "@balanse/domain";
import { Button, FeedbackState } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarClock, CircleCheck, Repeat2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminTodayYmd } from "@/lib/clock";
import { useCreateAdminRecurringSchedule } from "@/lib/query/mutations";
import { adminSessionsQuery } from "@/lib/query/queries";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import { BooleanBinding, CheckboxGroupBinding, DateBinding } from "@/modules/admin/forms/bindings";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { recurringScheduleFormDefaultValues } from "./RecurringScheduleForm.defaults";
import type { RecurringScheduleFormProps } from "./RecurringScheduleForm.meta";
import {
  type RecurringScheduleFormValues,
  recurringScheduleFormSchema,
} from "./RecurringScheduleForm.schema";

const FORM_ID = "recurring-schedule-form";

export function RecurringScheduleForm({ sessionId }: RecurringScheduleFormProps) {
  const { principal } = useMockPrincipal();
  const sessions = useSuspenseQuery(adminSessionsQuery(principal.role)).data;
  const source = sessions.find((session) => session.id === sessionId);
  const createRecurring = useCreateAdminRecurringSchedule();
  const router = useRouter();

  if (!source) {
    return (
      <AdminPageShell
        title="Recurring schedule"
        breadcrumb={[{ label: "Schedule", href: "/schedule" }]}
      >
        <FeedbackState id="admin.no-sessions" />
      </AdminPageShell>
    );
  }

  if (source.status === "CANCELLED") {
    return (
      <AdminPageShell
        title="Recurring schedule"
        breadcrumb={[{ label: "Schedule", href: "/schedule" }]}
      >
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">This session cannot repeat</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Cancelled sessions stay in history and cannot become templates.
          </p>
          <Button className="mt-5" nativeButton={false} render={<Link href="/schedule" />}>
            Back to schedule
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      eyebrow="Schedule tools"
      title="Make this session recurring"
      description="Use one session as the template for a bounded weekly series."
      breadcrumb={[{ label: "Schedule", href: "/schedule" }, { label: "Recurring schedule" }]}
      actions={
        <Button nativeButton={false} variant="outline" render={<Link href="/schedule" />}>
          Back to schedule
        </Button>
      }
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
              title: `${result.createdCount} recurring session${result.createdCount === 1 ? "" : "s"} created`,
              description:
                result.skippedCount > 0
                  ? `${result.skippedCount} matching session${result.skippedCount === 1 ? " was" : "s were"} already on the schedule.`
                  : "The new series is ready to review.",
            });
            router.push("/schedule");
          } catch (error) {
            notify.error({
              title: "Recurring schedule could not be created",
              description: String(error),
            });
            throw error;
          }
        }}
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
          <div className="grid gap-5">
            <TemplateCard session={source} />
            <FormSection
              title="Recurrence pattern"
              description="Weekly recurrence in Asia/Manila. Holiday exceptions are not applied automatically."
              surface="card"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField name="startsOn" label="Series starts">
                  {(field) => <DateBinding {...field} today={adminTodayYmd()} />}
                </FormField>
                <FormField name="endsOn" label="Series ends">
                  {(field) => <DateBinding {...field} today={adminTodayYmd()} />}
                </FormField>
              </div>
              <FormField name="weekdays" label="Repeat on">
                {(field) => (
                  <CheckboxGroupBinding
                    {...field}
                    options={WEEKDAYS.map((day) => ({
                      value: String(day.value),
                      label: day.label,
                    }))}
                  />
                )}
              </FormField>
              <FormField
                name="publish"
                label="Publish generated sessions"
                description="Off creates drafts so every occurrence can be reviewed before booking opens."
                orientation="horizontal"
              >
                {(field) => <BooleanBinding {...field} as="switch" />}
              </FormField>
            </FormSection>
          </div>
          <RecurrencePreview />
        </div>
        <FormActions
          submitLabel="Create recurring series"
          cancelHref="/schedule"
          formId={FORM_ID}
        />
      </AdminForm>
    </AdminPageShell>
  );
}

function TemplateCard({ session }: { session: AdminSession }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-primary px-5 py-6 text-primary-foreground md:px-6">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-foreground/10">
          <Repeat2 className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/60">
            Session template
          </p>
          <h2 className="mt-1 font-display text-2xl">{sessionDisplayName(session)}</h2>
          <p className="mt-2 text-sm text-primary-foreground/70">
            {formatSessionDate(session.startsAt)} · {formatSessionTime(session.startsAt)}–
            {formatSessionTime(session.endsAt)}
          </p>
          <p className="mt-1 text-sm text-primary-foreground/70">
            {session.coachName} · {formatPeso(session.pricePhp)} · {session.capacity} spots
          </p>
        </div>
      </div>
    </section>
  );
}

function RecurrencePreview() {
  const form = useAdminFormContext<RecurringScheduleFormValues>();
  const startsOn = form.watch("startsOn");
  const endsOn = form.watch("endsOn");
  const weekdays = form.watch("weekdays").map(Number) as Weekday[];
  const dates =
    isManilaYmd(startsOn) && isManilaYmd(endsOn)
      ? datesForWeeklyRecurrence({ startsOn, endsOn, weekdays })
      : [];

  return (
    <aside className="overflow-hidden rounded-2xl border border-border/70 bg-card lg:sticky lg:top-20">
      <div className="bg-primary px-5 py-6 text-primary-foreground">
        <CalendarClock className="size-5" aria-hidden />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/60">
          Series preview
        </p>
        <p className="mt-1 font-display text-3xl tabular-nums">{dates.length}</p>
        <p className="text-sm text-primary-foreground/70">planned occurrences</p>
      </div>
      <div className="grid gap-4 p-5 text-sm">
        <div className="flex gap-3">
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p className="text-muted-foreground">
            The original session remains unchanged. Matching class/start-time occurrences are
            skipped.
          </p>
        </div>
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p className="text-muted-foreground">
            Each new session gets its own capacity, price, coach assignments, and current coach-rate
            snapshots. No bookings are copied.
          </p>
        </div>
        {dates.length > 0 ? (
          <ul className="grid grid-cols-2 gap-1 border-t border-border pt-4 text-xs tabular-nums text-muted-foreground">
            {dates.slice(0, 8).map((date) => (
              <li key={date}>{date}</li>
            ))}
            {dates.length > 8 ? <li>+ {dates.length - 8} more</li> : null}
          </ul>
        ) : null}
      </div>
    </aside>
  );
}
