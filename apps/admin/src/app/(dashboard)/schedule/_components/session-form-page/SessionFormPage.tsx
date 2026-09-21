"use client";

import { BALANSE_BREAKPOINTS } from "@balanse/config";
import {
  type AdminClass,
  type AdminCoach,
  type AdminSession,
  auditConfirmationCopy,
  formatPeso,
  isManilaYmd,
  SESSION_RATE_SNAPSHOT_NOTE,
  SESSION_SLOTS_MANILA,
  SESSION_STATUSES,
  sessionDisplayName,
  sessionStatusLabel,
} from "@balanse/domain";
import { Button, FormPageSkeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Path } from "react-hook-form";
import { toCoachChoiceOption } from "@/components/balanse/coach/coach-option/CoachOption";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import {
  AdminWizard,
  AdminWizardStepPanel,
  useMinWidth,
} from "@/components/balanse/wizard/admin-wizard/AdminWizard";
import type {
  AdminWizardStep,
  AdminWizardSurface,
} from "@/components/balanse/wizard/admin-wizard/AdminWizard.meta";
import { adminNowIso, adminTodayYmd } from "@/lib/clock";
import { useCancelAdminSession, useUpsertAdminSession } from "@/lib/query/mutations";
import {
  adminClassesQuery,
  adminCoachesQuery,
  adminSessionRosterQuery,
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
  BooleanBinding,
  CheckboxGroupBinding,
  ChoiceBinding,
  ComboboxBinding,
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
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import type { SessionFormPageProps } from "./SessionFormPage.schema";

const CLOSE_HREF = "/schedule";
const SESSION_FORM_ID = "session-form";
const DEFAULT_START = SESSION_SLOTS_MANILA[0];

export function sessionWizardSteps(canSeeRates: boolean): AdminWizardStep[] {
  const steps: AdminWizardStep[] = [
    {
      id: "when",
      title: "When",
      description: "Class and time",
      fields: ["classId", "name", "startsAt", "endsAt"],
    },
    {
      id: "placement",
      title: "Placement",
      description: "Coaches, price, and publish",
      fields: ["coachIds", "pricePhp", "capacity", "bookable", "status"],
    },
  ];
  if (canSeeRates) {
    steps.push({
      id: "snapshot",
      title: "Snapshot",
      description: "Coach rates",
      fields: [],
    });
  }
  return steps;
}

export function SessionFormPage({ sessionId, date, surface = "page", step }: SessionFormPageProps) {
  const isNew = sessionId === "new";
  const { principal } = useMockPrincipal();
  const canSeeRates = principal.role === "admin";
  const classesQuery = useQuery(adminClassesQuery(principal.role));
  const coachesQuery = useQuery(adminCoachesQuery(principal.role));
  const sessionsQuery = useQuery(adminSessionsQuery(principal.role));
  const rosterQuery = useQuery({
    ...adminSessionRosterQuery(principal.role, sessionId),
    enabled: !isNew,
  });
  const upsert = useUpsertAdminSession();
  const router = useRouter();

  const classes = classesQuery.data ?? [];
  const coaches = coachesQuery.data ?? [];
  const existing = isNew ? undefined : sessionsQuery.data?.find((row) => row.id === sessionId);
  const ymd = isManilaYmd(date) ? date : adminTodayYmd();
  const consumed = isNew
    ? 0
    : (rosterQuery.data?.confirmedCount ?? 0) + (rosterQuery.data?.heldCount ?? 0);

  function leaveList() {
    if (surface === "overlay") {
      router.back();
      return;
    }
    router.push(CLOSE_HREF);
  }

  const listsPending =
    (classesQuery.isPending && !classesQuery.data) ||
    (coachesQuery.isPending && !coachesQuery.data) ||
    (!isNew && sessionsQuery.isPending && !sessionsQuery.data) ||
    (!isNew && rosterQuery.isPending && !rosterQuery.data);

  if (listsPending) {
    return (
      <AdminPageShell title={isNew ? "Create Session" : "Edit Session"}>
        <FormPageSkeleton label="Loading session" sections={3} fields={8} />
      </AdminPageShell>
    );
  }

  const defaultValues = existing
    ? sessionFormValuesFromSession(existing)
    : defaultsForCreate(
        ymd,
        classes.filter((row) => row.active),
      );

  return (
    <AdminForm
      id={SESSION_FORM_ID}
      key={`${existing?.id ?? (isNew ? `new-${ymd}` : `pending-${sessionId}`)}:${consumed}:${canSeeRates ? "admin" : "staff"}`}
      schema={makeSessionFormSchema({ consumed })}
      defaultValues={defaultValues}
      onSubmit={async (values) => {
        try {
          await upsert.mutateAsync({
            id: isNew ? undefined : sessionId,
            classId: values.classId,
            name: values.name || null,
            coachIds: values.coachIds,
            startsAt: values.startsAt,
            endsAt: values.endsAt,
            pricePhp: values.pricePhp,
            capacity: values.capacity,
            bookable: values.bookable,
            status: values.status,
          });
          notify.admin("session.saved");
          leaveList();
        } catch (error) {
          notify.admin("session.save-failed");
          throw error;
        }
      }}
    >
      <SessionWizardFields
        isNew={isNew}
        sessionId={sessionId}
        className={existing ? sessionDisplayName(existing) : undefined}
        classes={classes.filter((row) => row.active || row.id === existing?.classId)}
        coaches={coaches}
        assignments={existing?.coachAssignments ?? []}
        canSeeRates={canSeeRates}
        canCancel={!isNew && existing?.status !== "CANCELLED"}
        surface={surface}
        step={step}
        onLeaveList={leaveList}
      />
    </AdminForm>
  );
}

function defaultsForCreate(ymd: string, classes: AdminClass[]): SessionFormValues {
  const klass = classes[0];
  const start = DEFAULT_START;
  const end = endFromDuration(start, klass?.defaultDurationMinutes);
  return {
    ...sessionFormValuesForDate(ymd),
    classId: klass?.id ?? "",
    coachIds: [],
    startsAt: toSessionIso(ymd, start),
    endsAt: toSessionIso(ymd, end),
    pricePhp: klass?.defaultPricePhp ?? sessionFormDefaultValues.pricePhp,
  };
}

function endFromDuration(start: string, durationMinutes: number | null | undefined): string {
  if (durationMinutes == null || durationMinutes <= 0) return SESSION_SLOTS_MANILA[1];
  return addMinutesHhmm(start, durationMinutes);
}

function addMinutesHhmm(hhmm: string, minutes: number): string {
  const [hour, minute] = hhmm.split(":").map(Number);
  const total = (((hour * 60 + minute + minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function SessionWizardFields({
  isNew,
  sessionId,
  className,
  classes,
  coaches,
  assignments,
  canSeeRates,
  canCancel,
  surface,
  step: stepProp,
  onLeaveList,
}: {
  isNew: boolean;
  sessionId: string;
  className?: string;
  classes: AdminClass[];
  coaches: AdminCoach[];
  assignments: AdminSession["coachAssignments"];
  canSeeRates: boolean;
  canCancel: boolean;
  surface: AdminWizardSurface;
  step?: number;
  onLeaveList: () => void;
}) {
  const form = useAdminFormContext<SessionFormValues>();
  const router = useRouter();
  const cancel = useCancelAdminSession();
  const steps = useMemo(() => sessionWizardSteps(canSeeRates), [canSeeRates]);
  const guard = useUnsavedChangesGuard(form.formState.isDirty, (href) => {
    if (href === CLOSE_HREF) {
      onLeaveList();
      return;
    }
    router.push(href);
  });
  const [internalStep, setInternalStep] = useState(stepProp ?? 1);
  const current = stepProp ?? internalStep;
  const isLast = current >= steps.length;
  const mdUp = useMinWidth(BALANSE_BREAKPOINTS.tablet);

  function applyClassDefaults(classId: string) {
    const klass = classes.find((row) => row.id === classId);
    if (!klass) return;
    if (klass.defaultPricePhp != null) {
      form.setValue("pricePhp", klass.defaultPricePhp, { shouldDirty: true });
    }
    if (isNew && klass.defaultDurationMinutes != null) {
      const startsAt = form.getValues("startsAt");
      if (!startsAt) return;
      const { ymd, hhmm } = fromSessionIso(startsAt);
      form.setValue(
        "endsAt",
        toSessionIso(ymd, endFromDuration(hhmm, klass.defaultDurationMinutes)),
        {
          shouldDirty: true,
        },
      );
    }
  }

  return (
    <AdminWizard
      title={isNew ? "Create Session" : "Edit Session"}
      description={canSeeRates ? SESSION_RATE_SNAPSHOT_NOTE : undefined}
      steps={steps}
      mode={isNew ? "create" : "edit"}
      surface={surface}
      closeHref={CLOSE_HREF}
      breadcrumb={[
        { label: "Schedule", href: CLOSE_HREF },
        { label: isNew ? "Create Session" : (className ?? sessionId) },
      ]}
      step={current}
      onStepChange={setInternalStep}
      onRequestClose={() => guard.requestLeave(CLOSE_HREF)}
      hasStepError={(item) =>
        (item.fields ?? []).some(
          (name) => form.getFieldState(name as Path<SessionFormValues>).invalid,
        )
      }
      onBeforeStepChange={async (from, to) => {
        if (to <= from) return true;
        const fields = (steps[from - 1]?.fields ?? []) as Path<SessionFormValues>[];
        if (fields.length === 0) return true;
        return form.trigger(fields);
      }}
      footer={
        <FormActions
          submitLabel="Save"
          formId={SESSION_FORM_ID}
          hideSubmit={isNew && !isLast && mdUp}
          cancelHref={CLOSE_HREF}
          guard={guard}
          sticky={false}
          destructive={
            canCancel ? (
              <ConfirmAction
                triggerLabel="Cancel Session"
                title="Cancel this session?"
                description={`${auditConfirmationCopy("Cancel session", "Admin", adminNowIso())} Affected bookings enter manual refund handling. The session stays in history.`}
                variant="outline"
                onConfirm={async () => {
                  try {
                    await cancel.mutateAsync(sessionId);
                    notify.admin("session.cancelled");
                    onLeaveList();
                  } catch {
                    notify.admin("session.cancel-failed");
                  }
                }}
              />
            ) : null
          }
        >
          {current > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setInternalStep((value) => value - 1)}
            >
              Back
            </Button>
          ) : null}
          {!isLast ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void (async () => {
                  const fields = (steps[current - 1]?.fields ?? []) as Path<SessionFormValues>[];
                  const ok = fields.length === 0 ? true : await form.trigger(fields);
                  if (ok) setInternalStep((value) => value + 1);
                })();
              }}
            >
              Continue
            </Button>
          ) : null}
        </FormActions>
      }
    >
      <AdminWizardStepPanel stepId="when">
        <FormField name="classId" label="Class">
          {(field) => (
            <ComboboxBinding
              {...field}
              placeholder="Search class…"
              options={classes.map((row) => ({ value: row.id, label: row.name }))}
              onChange={(next) => {
                const classId = String(next ?? "");
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
          {(field) => (
            <TextBinding
              {...field}
              placeholder={
                classes.find((row) => row.id === form.watch("classId"))?.name ?? "Class name"
              }
            />
          )}
        </FormField>
        <SessionWhenFields />
      </AdminWizardStepPanel>
      <AdminWizardStepPanel stepId="placement">
        <FormField
          name="coachIds"
          label="Coaches"
          description="Choose at least one coach. You can assign multiple coaches to this session."
        >
          {(field) => (
            <CheckboxGroupBinding
              {...field}
              options={coaches
                .filter((coach) => coach.active || form.getValues("coachIds").includes(coach.id))
                .map(toCoachChoiceOption)}
            />
          )}
        </FormField>
        <FormSection title="Price and capacity" columns={2}>
          <FormField name="pricePhp" label="Customer Price">
            {(field) => <TextBinding {...field} type="number" />}
          </FormField>
          <FormField name="capacity" label="Capacity">
            {(field) => <TextBinding {...field} type="number" />}
          </FormField>
        </FormSection>
        <FormField name="bookable" label="Publish / bookable" orientation="horizontal">
          {(field) => <BooleanBinding {...field} as="switch" />}
        </FormField>
        <FormField name="status" label="Status">
          {(field) => (
            <ChoiceBinding
              {...field}
              options={SESSION_STATUSES.map((status) => ({
                value: status,
                label: sessionStatusLabel(status),
              }))}
            />
          )}
        </FormField>
      </AdminWizardStepPanel>
      {canSeeRates ? (
        <AdminWizardStepPanel stepId="snapshot">
          <p className="text-sm text-muted-foreground">{SESSION_RATE_SNAPSHOT_NOTE}</p>
          <ul className="space-y-3">
            {form.watch("coachIds").map((id) => {
              const coach = coaches.find((row) => row.id === id);
              const saved = assignments.find((row) => row.coachId === id);
              const rate = saved?.coachRatePhp ?? coach?.defaultRatePhp ?? 0;
              const rateType = saved?.coachRateType ?? coach?.rateType;
              return (
                <li key={id}>
                  {coach?.name ?? id} · {formatPeso(rate)} /{" "}
                  {rateType === "PER_HOUR" ? "hour" : "session"}{" "}
                  <span className="text-muted-foreground">
                    ({saved ? "saved rate" : "current default; captured on save"})
                  </span>
                </li>
              );
            })}
          </ul>
        </AdminWizardStepPanel>
      ) : null}
    </AdminWizard>
  );
}

function SessionWhenFields() {
  const form = useAdminFormContext<SessionFormValues>();
  const startsAt = form.watch("startsAt");
  const endsAt = form.watch("endsAt");
  const start = startsAt ? fromSessionIso(startsAt) : { ymd: "", hhmm: "" };
  const end = endsAt ? fromSessionIso(endsAt) : { ymd: start.ymd, hhmm: "" };

  return (
    <FormSection title="When" columns={2}>
      <FormField name="startsAt" label="Date" wireAria span="full">
        {(field) => (
          <DateBinding
            {...field}
            today={adminTodayYmd()}
            value={start.ymd}
            onChange={(next) => {
              const ymd = String(next ?? "");
              field.onChange(ymd && start.hhmm ? toSessionIso(ymd, start.hhmm) : "");
              form.setValue("endsAt", ymd && end.hhmm ? toSessionIso(ymd, end.hhmm) : "", {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
        )}
      </FormField>
      <FormField name="startsAt" label="Start" wireAria>
        {(field) => (
          <TimeBinding
            {...field}
            value={start.hhmm}
            onChange={(next) => {
              const hhmm = String(next ?? "");
              field.onChange(start.ymd && hhmm ? toSessionIso(start.ymd, hhmm) : "");
            }}
          />
        )}
      </FormField>
      <FormField name="endsAt" label="End" wireAria>
        {(field) => (
          <TimeBinding
            {...field}
            after={start.hhmm || undefined}
            value={end.hhmm}
            onChange={(next) => {
              const hhmm = String(next ?? "");
              field.onChange(
                end.ymd && hhmm
                  ? toSessionIso(end.ymd, hhmm)
                  : start.ymd && hhmm
                    ? toSessionIso(start.ymd, hhmm)
                    : "",
              );
            }}
          />
        )}
      </FormField>
    </FormSection>
  );
}
