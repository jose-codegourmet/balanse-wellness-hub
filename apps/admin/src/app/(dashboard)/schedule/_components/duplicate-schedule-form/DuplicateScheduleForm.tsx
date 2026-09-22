"use client";

import {
  type AdminSession,
  addCalendarDays,
  calendarDayDistance,
  isManilaYmd,
  manilaYmd,
  sessionDisplayName,
} from "@balanse/domain";
import { Button } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarRange, Copy, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminTodayYmd } from "@/lib/clock";
import { useDuplicateAdminSchedule } from "@/lib/query/mutations";
import { adminSessionsQuery } from "@/lib/query/queries";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import { BooleanBinding, DateBinding } from "@/modules/admin/forms/bindings";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { duplicateScheduleFormDefaultValues } from "./DuplicateScheduleForm.defaults";
import type { DuplicateScheduleFormProps } from "./DuplicateScheduleForm.meta";
import {
  type DuplicateScheduleFormValues,
  duplicateScheduleFormSchema,
} from "./DuplicateScheduleForm.schema";

const FORM_ID = "duplicate-schedule-form";

export function DuplicateScheduleForm({ sourceStart, sourceEnd }: DuplicateScheduleFormProps) {
  const { principal } = useMockPrincipal();
  const sessions = useSuspenseQuery(adminSessionsQuery(principal)).data;
  const duplicate = useDuplicateAdminSchedule();
  const router = useRouter();
  const defaults = duplicateScheduleFormDefaultValues(adminTodayYmd());
  const resolvedSourceStart = sourceStart ?? defaults.sourceStart;
  const resolvedSourceEnd = sourceEnd ?? defaults.sourceEnd;

  return (
    <AdminPageShell
      eyebrow="Schedule tools"
      title="Duplicate a schedule range"
      description="Copy a proven week or month forward while keeping each generated session independent."
      breadcrumb={[{ label: "Schedule", href: "/schedule" }, { label: "Duplicate range" }]}
      actions={
        <Button nativeButton={false} variant="outline" render={<Link href="/schedule" />}>
          Back to schedule
        </Button>
      }
    >
      <AdminForm
        id={FORM_ID}
        schema={duplicateScheduleFormSchema}
        defaultValues={{
          ...defaults,
          sourceStart: resolvedSourceStart,
          sourceEnd: resolvedSourceEnd,
          targetStart: isManilaYmd(resolvedSourceEnd)
            ? addCalendarDays(resolvedSourceEnd, 1)
            : defaults.targetStart,
        }}
        onSubmit={async (values) => {
          try {
            const result = await duplicate.mutateAsync(values);
            notify.success({
              title: `${result.createdCount} session${result.createdCount === 1 ? "" : "s"} created`,
              description:
                result.skippedCount > 0
                  ? `${result.skippedCount} exact duplicate${result.skippedCount === 1 ? " was" : "s were"} skipped.`
                  : "The copied schedule is ready to review.",
            });
            router.push("/schedule");
          } catch (error) {
            notify.error({ title: "Schedule could not be duplicated", description: String(error) });
            throw error;
          }
        }}
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <FormSection
            title="Choose the source and destination"
            description="Dates are interpreted in Asia/Manila. Cancelled sessions and bookings are never copied."
            surface="card"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField name="sourceStart" label="Source starts">
                {(field) => <DateBinding {...field} today={adminTodayYmd()} />}
              </FormField>
              <FormField name="sourceEnd" label="Source ends">
                {(field) => <DateBinding {...field} today={adminTodayYmd()} />}
              </FormField>
              <FormField
                name="targetStart"
                label="New range starts"
                description="Every session keeps its offset from the source start."
                span="full"
              >
                {(field) => <DateBinding {...field} today={adminTodayYmd()} />}
              </FormField>
              <FormField
                name="publish"
                label="Publish generated sessions"
                description="Off creates drafts so the copied schedule can be reviewed first."
                orientation="horizontal"
                span="full"
              >
                {(field) => <BooleanBinding {...field} as="switch" />}
              </FormField>
            </div>
          </FormSection>
          <DuplicatePreview sessions={sessions} />
        </div>
        <FormActions submitLabel="Duplicate schedule" cancelHref="/schedule" formId={FORM_ID} />
      </AdminForm>
    </AdminPageShell>
  );
}

function DuplicatePreview({ sessions }: { sessions: AdminSession[] }) {
  const form = useAdminFormContext<DuplicateScheduleFormValues>();
  const sourceStart = form.watch("sourceStart");
  const sourceEnd = form.watch("sourceEnd");
  const targetStart = form.watch("targetStart");
  const datesAreValid =
    isManilaYmd(sourceStart) && isManilaYmd(sourceEnd) && isManilaYmd(targetStart);
  const matching = datesAreValid
    ? sessions.filter((session) => {
        const ymd = manilaYmd(session.startsAt);
        return ymd >= sourceStart && ymd <= sourceEnd && session.status !== "CANCELLED";
      })
    : [];
  const span = datesAreValid ? calendarDayDistance(sourceStart, sourceEnd) : -1;
  const targetEnd = span >= 0 ? addCalendarDays(targetStart, span) : targetStart;

  return (
    <aside className="overflow-hidden rounded-2xl border border-border/70 bg-card lg:sticky lg:top-20">
      <div className="bg-primary px-5 py-6 text-primary-foreground">
        <Copy className="size-5" aria-hidden />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/60">
          Copy preview
        </p>
        <p className="mt-1 font-display text-3xl tabular-nums">{matching.length}</p>
        <p className="text-sm text-primary-foreground/70">sessions found</p>
      </div>
      <div className="grid gap-4 p-5 text-sm">
        <div className="flex gap-3">
          <CalendarRange className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p>
            Target range
            <br />
            <span className="text-muted-foreground">
              {targetStart} to {targetEnd}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p className="text-muted-foreground">
            Exact class/start-time matches are skipped. Coach assignments, price, capacity, and
            duration are copied; current coach rates are captured as new snapshots.
          </p>
        </div>
        {matching.length > 0 ? (
          <ul className="grid gap-1 border-t border-border pt-4 text-xs text-muted-foreground">
            {matching.slice(0, 4).map((session) => (
              <li key={session.id} className="truncate">
                {sessionDisplayName(session)}
              </li>
            ))}
            {matching.length > 4 ? <li>+ {matching.length - 4} more</li> : null}
          </ul>
        ) : null}
      </div>
    </aside>
  );
}
