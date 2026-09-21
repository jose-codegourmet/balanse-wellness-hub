"use client";

import {
  type AdminCoach,
  type AdminSession,
  COACH_DEFAULT_RATE_NOTE,
  COACH_RATE_TYPES,
  coachRateTypeLabel,
  FIELD_CONSTRAINTS,
  formatSessionDate,
  formatSessionTime,
} from "@balanse/domain";
import { CardListSkeleton, FormPageSkeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { FieldErrors } from "react-hook-form";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { AdminPageTabs } from "@/components/balanse/page/admin-page-tabs/AdminPageTabs";
import { useTabParam } from "@/components/balanse/page/useTabParam";
import { adminNowIso } from "@/lib/clock";
import { useUpsertAdminCoach } from "@/lib/query/mutations";
import { adminCoachesQuery, adminSessionsQuery } from "@/lib/query/queries";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "../forms/AdminForm";
import {
  BooleanBinding,
  ChoiceBinding,
  ImageBinding,
  RichTextBinding,
  TagListBinding,
  TextBinding,
} from "../forms/bindings";
import {
  coachFormDefaultValues,
  coachPublicFormDefaultValues,
} from "../forms/coach/coach-form.defaults";
import {
  type CoachFormValues,
  type CoachPublicFormValues,
  coachFormSchema,
  coachPublicFormSchema,
} from "../forms/coach/coach-form.schema";

export type CoachFormTabId = "photo" | "profile" | "financials" | "sessions";

export type CoachFormPageProps = {
  coachId: string;
  /** Storybook / URL fallback. Live routes still prefer `?tab=`. */
  initialTab?: CoachFormTabId;
};

const TAB_LABELS: Record<CoachFormTabId, string> = {
  photo: "Profile photo",
  profile: "Public profile",
  financials: "Internal financials",
  sessions: "Upcoming sessions",
};

const TAB_FIELDS: Record<CoachFormTabId, readonly string[]> = {
  photo: ["photoKey"],
  profile: ["name", "specialties", "shortBio", "active"],
  financials: ["defaultRatePhp", "rateType"],
  sessions: [],
};

function tabHasError(tab: CoachFormTabId, errors: FieldErrors): boolean {
  return TAB_FIELDS[tab].some((name) => Boolean(errors[name as keyof typeof errors]));
}

function firstTabWithError(
  errors: FieldErrors,
  tabs: readonly CoachFormTabId[],
): CoachFormTabId | null {
  for (const tab of tabs) {
    if (tabHasError(tab, errors)) return tab;
  }
  return null;
}

function valuesFromCoach(
  coach: AdminCoach,
  canSeeRates: boolean,
): CoachFormValues | CoachPublicFormValues {
  const publicValues: CoachPublicFormValues = {
    name: coach.name,
    specialties: coach.specialties,
    shortBio: coach.shortBio,
    photoKey: coach.photoKey,
    active: coach.active,
  };
  if (!canSeeRates) return publicValues;
  return {
    ...publicValues,
    defaultRatePhp: coach.defaultRatePhp,
    rateType: coach.rateType,
  };
}

export function CoachFormPage({ coachId, initialTab }: CoachFormPageProps) {
  const router = useRouter();
  const isNew = coachId === "new";
  const { principal } = useMockPrincipal();
  const canSeeRates = principal.role === "admin";
  const coachesQuery = useQuery(adminCoachesQuery(principal.role));
  const sessionsQuery = useQuery(adminSessionsQuery(principal.role));
  const upsert = useUpsertAdminCoach();
  const existing = isNew ? undefined : coachesQuery.data?.find((row) => row.id === coachId);

  const tabIds = useMemo(() => {
    const ids: CoachFormTabId[] = ["photo", "profile"];
    if (canSeeRates) ids.push("financials");
    if (!isNew) ids.push("sessions");
    return ids;
  }, [canSeeRates, isNew]);

  const [tab, setTab] = useTabParam(
    "tab",
    tabIds,
    initialTab && tabIds.includes(initialTab) ? initialTab : "photo",
  );

  const upcoming = useMemo(() => {
    if (!sessionsQuery.data || isNew) return [];
    const nowIso = adminNowIso();
    return sessionsQuery.data.filter(
      (session) => session.coachId === coachId && session.startsAt >= nowIso,
    );
  }, [coachId, isNew, sessionsQuery.data]);

  if (!isNew && coachesQuery.isPending && !coachesQuery.data) {
    return (
      <AdminPageShell
        title="Edit Coach"
        breadcrumb={[{ label: "Coaches", href: "/coaches" }, { label: coachId }]}
      >
        <FormPageSkeleton label="Loading coach" sections={3} fields={4} tabs={4} />
      </AdminPageShell>
    );
  }

  const defaultValues = existing
    ? valuesFromCoach(existing, canSeeRates)
    : canSeeRates
      ? coachFormDefaultValues
      : coachPublicFormDefaultValues;

  return (
    <AdminPageShell
      title={isNew ? "Add Coach" : "Edit Coach"}
      breadcrumb={[
        { label: "Coaches", href: "/coaches" },
        { label: isNew ? "Add Coach" : (existing?.name ?? coachId) },
      ]}
    >
      <AdminForm
        key={`${existing?.id ?? (isNew ? "new" : `pending-${coachId}`)}:${canSeeRates ? "admin" : "public"}`}
        id="coach-form"
        className="mt-6"
        schema={canSeeRates ? coachFormSchema : coachPublicFormSchema}
        defaultValues={defaultValues}
        onSubmit={async (values) => {
          try {
            const publicValues = values as CoachPublicFormValues;
            const rateValues = canSeeRates
              ? (values as CoachFormValues)
              : {
                  defaultRatePhp: existing?.defaultRatePhp ?? 0,
                  rateType: existing?.rateType ?? "PER_SESSION",
                };
            await upsert.mutateAsync({
              id: isNew ? undefined : coachId,
              name: publicValues.name,
              specialties: publicValues.specialties,
              shortBio: publicValues.shortBio,
              photoKey: publicValues.photoKey,
              active: publicValues.active,
              defaultRatePhp: rateValues.defaultRatePhp,
              rateType: rateValues.rateType,
            });
            notify.admin("coach.saved");
            router.push("/coaches");
          } catch (error) {
            notify.admin("coach.save-failed");
            throw error;
          }
        }}
        onSubmitError={(error) => {
          if (!error || typeof error !== "object") return;
          const next = firstTabWithError(error as FieldErrors, tabIds);
          if (next) setTab(next);
        }}
      >
        <CoachFormFields
          tab={tab}
          setTab={setTab}
          tabIds={tabIds}
          canSeeRates={canSeeRates}
          isNew={isNew}
          upcoming={upcoming}
          sessionsPending={sessionsQuery.isPending && !sessionsQuery.data}
        />
        <FormActions submitLabel="Save Changes" cancelHref="/coaches" />
      </AdminForm>
    </AdminPageShell>
  );
}

function CoachFormFields({
  tab,
  setTab,
  tabIds,
  canSeeRates,
  isNew,
  upcoming,
  sessionsPending,
}: {
  tab: CoachFormTabId;
  setTab: (next: CoachFormTabId) => void;
  tabIds: readonly CoachFormTabId[];
  canSeeRates: boolean;
  isNew: boolean;
  upcoming: AdminSession[];
  sessionsPending: boolean;
}) {
  const { formState, watch } = useAdminFormContext<CoachFormValues>();
  const previewName = watch("name") || "Coach";
  const photoKey = watch("photoKey");

  const tabs = tabIds.map((id) => ({
    id,
    label: tabHasError(id, formState.errors) ? `${TAB_LABELS[id]} · errors` : TAB_LABELS[id],
    error: tabHasError(id, formState.errors),
  }));

  return (
    <>
      <AdminPageTabs
        tabs={tabs}
        value={tab}
        onValueChange={(next) => setTab(next as CoachFormTabId)}
        mobileBehavior="tabs"
        label="Coach profile"
      />

      <section data-slot="coach-photo" className={tab === "photo" ? undefined : "hidden"}>
        <FormSection title="Profile photo" surface="card">
          <FormField name="photoKey" label="Profile photo" wireAria>
            {(field) => (
              <ImageBinding
                {...field}
                label={photoKey ? "Replace Photo" : "Upload Photo"}
                fallbackLabel="Crest fallback when no photo is saved."
                previewName={previewName}
              />
            )}
          </FormField>
        </FormSection>
      </section>

      <section
        data-slot="coach-profile"
        className={tab === "profile" ? undefined : "hidden"}
      >
        <FormSection title="Public profile" surface="card">
          <FormField name="name" label="Name" required>
            {(field) => <TextBinding {...field} />}
          </FormField>
          <FormField
            name="specialties"
            label="Specialty / Classes"
            description="Add each specialty as its own chip. Required when the coach is active."
            span="full"
          >
            {(field) => <TagListBinding {...field} />}
          </FormField>
          <FormField name="shortBio" label="Short bio" optional span="full">
            {(field) => (
              <RichTextBinding {...field} maxLength={FIELD_CONSTRAINTS.coach.shortBio.max} />
            )}
          </FormField>
          <FormField name="active" label="Status: Active" orientation="horizontal">
            {(field) => <BooleanBinding {...field} as="switch" />}
          </FormField>
        </FormSection>
      </section>

      {canSeeRates ? (
        <section
          data-slot="internal-financials"
          className={
            tab === "financials"
              ? "rounded-xl border border-dashed border-border bg-muted/40 p-4"
              : "hidden rounded-xl border border-dashed border-border bg-muted/40 p-4"
          }
        >
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Internal only — admin
          </p>
          <FormSection
            title="Internal financials"
            description={COACH_DEFAULT_RATE_NOTE}
            columns={2}
          >
            <FormField name="defaultRatePhp" label="Default rate">
              {(field) => <TextBinding {...field} type="number" />}
            </FormField>
            <FormField name="rateType" label="Rate type">
              {(field) => (
                <ChoiceBinding
                  {...field}
                  options={COACH_RATE_TYPES.map((type) => ({
                    value: type,
                    label: coachRateTypeLabel(type),
                  }))}
                />
              )}
            </FormField>
          </FormSection>
        </section>
      ) : null}

      {!isNew ? (
        <section
          data-slot="coach-sessions"
          className={tab === "sessions" ? undefined : "hidden"}
        >
          <h2 className="font-display text-2xl">Upcoming sessions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Read-only. Coach schedules are not edited here.
          </p>
          {sessionsPending ? (
            <CardListSkeleton label="Loading coach" items={2} />
          ) : upcoming.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No upcoming assigned sessions.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {upcoming.map((session) => (
                <li key={session.id} className="rounded-xl border border-border p-3 text-sm">
                  {session.className} · {formatSessionDate(session.startsAt)} ·{" "}
                  {formatSessionTime(session.startsAt)}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </>
  );
}
