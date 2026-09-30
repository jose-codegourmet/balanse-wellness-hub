"use client";

import {
  type AdminSession,
  CLASS_CHANGE_KIND_META,
  CLASS_CHANGE_REQUEST_KINDS,
  type ClassChangeRequestKind,
  formatSessionDate,
  formatSessionTimeRange,
  sessionDisplayName,
} from "@balanse/domain";
import { Alert, AlertDescription, AlertTitle, Badge, Button, FormPageSkeleton } from "@balanse/ui";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminNowIso } from "@/lib/clock";
import { useCreateClassChangeRequest, useWithdrawClassChangeRequest } from "@/lib/query/mutations";
import {
  adminClassChangeRequestsQuery,
  adminSessionsQuery,
  adminSubstituteCoachOptionsQuery,
} from "@/lib/query/queries";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import {
  ChoiceBinding,
  DateBinding,
  TextareaBinding,
  TimeBinding,
} from "@/modules/admin/forms/bindings";
import { classChangeFormValuesFor } from "@/modules/admin/forms/class-change/class-change-form.defaults";
import {
  type ClassChangeFormValues,
  classChangeFormSchema,
} from "@/modules/admin/forms/class-change/class-change-form.schema";
import { toSessionIso } from "@/modules/admin/forms/session/session-form.schema";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { ClassChangeRequestCard } from "../class-change-request-card/ClassChangeRequestCard";

const BREADCRUMB = (label: string) => [{ label: "Schedule", href: "/schedule" }, { label }];

function isKind(value: string | undefined): value is ClassChangeRequestKind {
  return CLASS_CHANGE_REQUEST_KINDS.includes(value as ClassChangeRequestKind);
}

/**
 * Coach-facing: ask the studio to reschedule a class, hand it to a substitute,
 * or cancel it. Nothing changes until an Admin / Super Admin approves.
 */
export function ClassChangeRequestPage({
  sessionId,
  initialKind,
}: {
  sessionId: string;
  initialKind?: string;
}) {
  const { principal } = useMockPrincipal();
  const sessionsQuery = useSuspenseQuery(adminSessionsQuery(principal));
  const requestsQuery = useQuery(adminClassChangeRequestsQuery(principal));
  const withdraw = useWithdrawClassChangeRequest();
  const session = sessionsQuery.data.find((row) => row.id === sessionId);

  if (!session) {
    return (
      <AdminPageShell title="Class unavailable" breadcrumb={BREADCRUMB("Request a change")}>
        <p className="text-sm text-muted-foreground">
          This class is not on your schedule. Only the coach assigned to a class can request a
          change.
        </p>
      </AdminPageShell>
    );
  }

  const requests = (requestsQuery.data ?? []).filter((row) => row.sessionId === session.id);
  const pending = requests.find((row) => row.status === "PENDING");
  const history = requests.filter((row) => row.status !== "PENDING");
  const started = Date.parse(session.startsAt) <= Date.parse(adminNowIso());
  const closed = session.status === "CANCELLED" || started;

  return (
    <AdminPageShell
      eyebrow="Can't make it?"
      title="Request a class change"
      description="Coaches cannot cancel a class on their own. Ask to reschedule it or hand it to a substitute first — the studio approves every change."
      breadcrumb={BREADCRUMB("Request a change")}
      className="max-w-3xl"
    >
      <SessionSummary session={session} />

      {requestsQuery.isPending ? (
        <FormPageSkeleton label="Loading requests" sections={1} fields={3} />
      ) : pending ? (
        <div className="grid gap-3">
          <ClassChangeRequestCard
            request={pending}
            actions={
              <ConfirmAction
                triggerLabel="Withdraw request"
                title="Withdraw this request?"
                description="The class stays as it is. You can send a new request afterwards."
                confirmLabel="Withdraw"
                variant="outline"
                onConfirm={async () => {
                  try {
                    await withdraw.mutateAsync(pending.id);
                    notify.admin("class-change.withdrawn");
                  } catch {
                    notify.admin("class-change.request-failed");
                  }
                }}
              />
            }
          />
          <p className="text-sm text-muted-foreground">
            One request per class at a time. Withdraw it to ask for something different.
          </p>
        </div>
      ) : closed ? (
        <Alert>
          <InfoIcon aria-hidden />
          <AlertTitle>
            {session.status === "CANCELLED" ? "This class is cancelled" : "This class has started"}
          </AlertTitle>
          <AlertDescription>
            Changes can only be requested for upcoming classes. Contact the front desk for anything
            urgent.
          </AlertDescription>
        </Alert>
      ) : (
        <ClassChangeForm
          session={session}
          initialKind={isKind(initialKind) ? initialKind : "RESCHEDULE"}
        />
      )}

      {history.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="font-display text-2xl">Earlier requests for this class</h2>
          {history.map((request) => (
            <ClassChangeRequestCard key={request.id} request={request} />
          ))}
        </section>
      ) : null}
    </AdminPageShell>
  );
}

function SessionSummary({ session }: { session: AdminSession }) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-2xl">{sessionDisplayName(session)}</h2>
        {session.status === "CANCELLED" ? <Badge variant="danger">Cancelled</Badge> : null}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatSessionDate(session.startsAt)} ·{" "}
        {formatSessionTimeRange(session.startsAt, session.endsAt)} · {session.coachName}
      </p>
    </section>
  );
}

function ClassChangeForm({
  session,
  initialKind,
}: {
  session: AdminSession;
  initialKind: ClassChangeRequestKind;
}) {
  const create = useCreateClassChangeRequest();
  return (
    <AdminForm
      schema={classChangeFormSchema}
      defaultValues={classChangeFormValuesFor(initialKind)}
      onSubmit={async (values: ClassChangeFormValues) => {
        try {
          await create.mutateAsync({
            sessionId: session.id,
            kind: values.kind,
            reason: values.reason,
            proposedStartsAt:
              values.kind === "RESCHEDULE"
                ? new Date(toSessionIso(values.proposedDate, values.proposedTime)).toISOString()
                : null,
            substituteCoachId: values.kind === "SUBSTITUTE" ? values.substituteCoachId : null,
          });
          notify.admin("class-change.requested");
        } catch (error) {
          notify.admin("class-change.request-failed");
          throw error;
        }
      }}
    >
      <FormSection title="What do you need?" surface="card">
        <FormField name="kind" label="Change">
          {(field) => (
            <ChoiceBinding
              {...field}
              as="radio"
              options={CLASS_CHANGE_REQUEST_KINDS.map((kind) => ({
                value: kind,
                label: CLASS_CHANGE_KIND_META[kind].action,
                description: CLASS_CHANGE_KIND_META[kind].description,
              }))}
            />
          )}
        </FormField>
        <KindFields session={session} />
        <FormField
          name="reason"
          label="Reason"
          description="The studio sees this when reviewing. Be specific so they can decide quickly."
        >
          {(field) => <TextareaBinding {...field} rows={4} />}
        </FormField>
      </FormSection>
      <FormActions submitLabel="Send request" cancelHref="/schedule" />
    </AdminForm>
  );
}

function KindFields({ session }: { session: AdminSession }) {
  const { watch } = useAdminFormContext<ClassChangeFormValues>();
  const kind = watch("kind");
  if (kind === "RESCHEDULE") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <p className="text-sm text-muted-foreground sm:col-span-2">
          {CLASS_CHANGE_KIND_META.RESCHEDULE.description}
        </p>
        <FormField name="proposedDate" label="New date" wireAria>
          {(field) => <DateBinding {...field} />}
        </FormField>
        <FormField
          name="proposedTime"
          label="New start time"
          description="The class keeps its length."
          wireAria
        >
          {(field) => <TimeBinding {...field} />}
        </FormField>
      </div>
    );
  }
  if (kind === "SUBSTITUTE")
    return (
      <div className="grid gap-4">
        <p className="text-sm text-muted-foreground">
          {CLASS_CHANGE_KIND_META.SUBSTITUTE.description}
        </p>
        <SubstituteField sessionId={session.id} />
      </div>
    );
  return (
    <Alert variant="destructive">
      <InfoIcon aria-hidden />
      <AlertTitle>Cancelling affects booked customers</AlertTitle>
      <AlertDescription>
        If approved, every booking goes to manual refund handling. Ask for a reschedule or a
        substitute first if either could work.
      </AlertDescription>
    </Alert>
  );
}

function SubstituteField({ sessionId }: { sessionId: string }) {
  const { principal } = useMockPrincipal();
  const optionsQuery = useQuery(adminSubstituteCoachOptionsQuery(principal, sessionId));
  const options = (optionsQuery.data ?? []).map((coach) => ({
    value: coach.id,
    label: coach.name,
    description: coach.clash ? "Teaching another class at this time" : "Free at this time",
  }));
  return (
    <FormField
      name="substituteCoachId"
      label="Substitute coach"
      description="Ask them first. The studio confirms the swap when approving."
    >
      {(field) => <ChoiceBinding {...field} as="select" options={options} />}
    </FormField>
  );
}
