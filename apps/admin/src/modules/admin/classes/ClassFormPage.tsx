"use client";

import { Button, FormPageSkeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Path } from "react-hook-form";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { AdminWizard, AdminWizardStepPanel } from "@/components/balanse/wizard/AdminWizard";
import type {
  AdminWizardStep,
  AdminWizardSurface,
} from "@/components/balanse/wizard/AdminWizard.schema";
import { useUpsertAdminClass } from "@/lib/query/mutations";
import { adminClassesQuery, adminCoachesQuery } from "@/lib/query/queries";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { AdminForm, FormActions, FormField, useAdminFormContext } from "../forms/AdminForm";
import {
  BooleanBinding,
  CheckboxGroupBinding,
  TextareaBinding,
  TextBinding,
} from "../forms/bindings";
import { classFormDefaultValues } from "../forms/class/class-form.defaults";
import { type ClassFormValues, classFormSchema } from "../forms/class/class-form.schema";
import { useUnsavedChangesGuard } from "../forms/useUnsavedChangesGuard";

export const classWizardSteps: AdminWizardStep[] = [
  {
    id: "basics",
    title: "Basics",
    description: "Name and description",
    fields: ["name", "shortDescription"],
  },
  {
    id: "defaults",
    title: "Defaults",
    description: "Duration and price",
    fields: ["defaultDurationMinutes", "defaultPricePhp"],
  },
  {
    id: "coaches",
    title: "Coaches & status",
    description: "Roster and visibility",
    fields: ["associatedCoachIds", "active"],
  },
];

const CLOSE_HREF = "/classes";
const DEFAULTS_NOTE =
  "Session values override class defaults. Do not store coach compensation as class information.";

export function ClassFormPage({
  classId,
  surface = "page",
  step,
}: {
  classId: string;
  surface?: AdminWizardSurface;
  step?: number;
}) {
  const isNew = classId === "new";
  const { principal } = useMockPrincipal();
  const classesQuery = useQuery(adminClassesQuery(principal.role));
  const coachesQuery = useQuery(adminCoachesQuery(principal.role));
  const coaches = coachesQuery.data ?? [];
  const existing = isNew ? undefined : classesQuery.data?.find((row) => row.id === classId);
  const upsert = useUpsertAdminClass();
  const router = useRouter();

  const defaultValues = existing
    ? {
        name: existing.name,
        shortDescription: existing.shortDescription,
        defaultDurationMinutes: existing.defaultDurationMinutes,
        defaultPricePhp: existing.defaultPricePhp,
        active: existing.active,
        associatedCoachIds: existing.associatedCoachIds,
      }
    : classFormDefaultValues;

  if (!isNew && classesQuery.isLoading) {
    return (
      <AdminPageShell title="Edit Class">
        <FormPageSkeleton label="Loading class" sections={3} fields={6} />
      </AdminPageShell>
    );
  }

  return (
    <AdminForm
      key={existing?.id ?? (isNew ? "new" : `pending-${classId}`)}
      schema={classFormSchema}
      defaultValues={defaultValues}
      onSubmit={async (values) => {
        try {
          await upsert.mutateAsync({
            id: isNew ? undefined : classId,
            ...values,
          });
          notify.admin("class.saved");
          router.push(CLOSE_HREF);
        } catch (error) {
          notify.admin("class.save-failed");
          throw error;
        }
      }}
    >
      <ClassWizardFields
        isNew={isNew}
        classId={classId}
        className={existing?.name}
        coaches={coaches}
        surface={surface}
        step={step}
      />
    </AdminForm>
  );
}

function ClassWizardFields({
  isNew,
  classId,
  className,
  coaches,
  surface,
  step: stepProp,
}: {
  isNew: boolean;
  classId: string;
  className?: string;
  coaches: { id: string; name: string }[];
  surface: AdminWizardSurface;
  step?: number;
}) {
  const form = useAdminFormContext<ClassFormValues>();
  const guard = useUnsavedChangesGuard(form.formState.isDirty);
  const [internalStep, setInternalStep] = useState(stepProp ?? 1);
  const current = stepProp ?? internalStep;
  const isLast = current >= classWizardSteps.length;

  return (
    <AdminWizard
      title={isNew ? "Add Class" : "Edit Class"}
      description={DEFAULTS_NOTE}
      steps={classWizardSteps}
      mode={isNew ? "create" : "edit"}
      surface={surface}
      closeHref={CLOSE_HREF}
      breadcrumb={[
        { label: "Classes", href: CLOSE_HREF },
        { label: isNew ? "Add Class" : (className ?? classId) },
      ]}
      step={current}
      onStepChange={setInternalStep}
      onRequestClose={() => guard.requestLeave(CLOSE_HREF)}
      hasStepError={(item) =>
        (item.fields ?? []).some(
          (name) => form.getFieldState(name as Path<ClassFormValues>).invalid,
        )
      }
      onBeforeStepChange={async (from, to) => {
        if (to <= from) return true;
        const fields = (classWizardSteps[from - 1]?.fields ?? []) as Path<ClassFormValues>[];
        if (fields.length === 0) return true;
        return form.trigger(fields);
      }}
      footer={
        <FormActions
          submitLabel="Save"
          hideSubmit={isNew && !isLast}
          cancelHref={CLOSE_HREF}
          guard={guard}
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
                  const fields = (classWizardSteps[current - 1]?.fields ??
                    []) as Path<ClassFormValues>[];
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
      <AdminWizardStepPanel stepId="basics">
        <FormField name="name" label="Name">
          {(field) => <TextBinding {...field} />}
        </FormField>
        <FormField name="shortDescription" label="Short description">
          {(field) => <TextareaBinding {...field} rows={4} />}
        </FormField>
      </AdminWizardStepPanel>
      <AdminWizardStepPanel stepId="defaults">
        <p className="text-sm text-muted-foreground">{DEFAULTS_NOTE}</p>
        <FormField name="defaultDurationMinutes" label="Default duration (optional)">
          {(field) => <TextBinding {...field} type="number" />}
        </FormField>
        <FormField name="defaultPricePhp" label="Default price (optional)">
          {(field) => <TextBinding {...field} type="number" />}
        </FormField>
      </AdminWizardStepPanel>
      <AdminWizardStepPanel stepId="coaches">
        <FormField name="active" label="Active" orientation="horizontal">
          {(field) => <BooleanBinding {...field} as="switch" />}
        </FormField>
        <FormField name="associatedCoachIds" label="Associated coaches (optional)">
          {(field) => (
            <CheckboxGroupBinding
              {...field}
              options={coaches.map((coach) => ({ value: coach.id, label: coach.name }))}
            />
          )}
        </FormField>
      </AdminWizardStepPanel>
    </AdminWizard>
  );
}
