"use client";

import {
  ADMIN_ROLE_CAPABILITY_NOTE,
  STAFF_ROLES,
  staffRoleLabel,
  staffStatusLabel,
} from "@balanse/domain";
import { FormPageSkeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useDisableAdminStaff, useUpsertAdminStaff } from "@/lib/query/mutations";
import { adminStaffQuery } from "@/lib/query/queries";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/AdminForm";
import { BooleanBinding, ChoiceBinding, TextBinding } from "@/modules/admin/forms/bindings";
import { staffFormDefaultValues } from "@/modules/admin/forms/staff/staff-form.defaults";
import {
  type StaffFormValues,
  staffFormSchema,
} from "@/modules/admin/forms/staff/staff-form.schema";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import type { StaffDetailPageProps } from "./StaffDetailPage.schema";

export function StaffDetailPage({ staffId }: StaffDetailPageProps) {
  const router = useRouter();
  const isNew = staffId === "new";
  const { principal } = useMockPrincipal();
  const query = useQuery(adminStaffQuery(principal.role));
  const upsert = useUpsertAdminStaff();
  const disable = useDisableAdminStaff();
  const existing = isNew ? undefined : query.data?.find((row) => row.id === staffId);

  if (!isNew && query.isPending && !query.data) {
    return (
      <AdminPageShell
        title="Staff Detail"
        breadcrumb={[{ label: "Staff", href: "/staff" }, { label: staffId }]}
      >
        <FormPageSkeleton label="Loading staff" sections={1} fields={4} />
      </AdminPageShell>
    );
  }

  if (!isNew && query.data && !existing) return null;

  const defaultValues: StaffFormValues = existing
    ? {
        name: existing.name,
        email: existing.email,
        role: existing.role,
        status: existing.status,
        isCoach: existing.isCoach,
      }
    : staffFormDefaultValues;

  return (
    <AdminPageShell
      className="max-w-xl"
      title={isNew ? "Add Staff" : "Staff Detail"}
      breadcrumb={[
        { label: "Staff", href: "/staff" },
        { label: isNew ? "Add Staff" : (existing?.name ?? staffId) },
      ]}
    >
      <p className="text-sm text-muted-foreground">
        Invite or provision a staff account. There is no public admin registration.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{ADMIN_ROLE_CAPABILITY_NOTE}</p>
      <AdminForm
        key={`${existing?.id ?? (isNew ? "new" : `pending-${staffId}`)}:${existing?.status ?? "active"}`}
        id="staff-form"
        className="mt-6"
        schema={staffFormSchema}
        defaultValues={defaultValues}
        onSubmit={async (values) => {
          try {
            await upsert.mutateAsync({
              id: isNew ? undefined : staffId,
              name: values.name,
              email: values.email,
              role: values.role,
              status: values.status,
              isCoach: values.isCoach,
            });
            notify.admin("staff.saved");
            router.push("/staff");
          } catch (error) {
            notify.admin("staff.save-failed");
            throw error;
          }
        }}
      >
        <StaffFormFields
          isNew={isNew}
          coachId={existing?.coachId ?? null}
          status={existing?.status ?? "active"}
          onDisable={async () => {
            try {
              await disable.mutateAsync(staffId);
              notify.admin("staff.disabled");
            } catch (error) {
              notify.admin("staff.disable-failed");
              throw error;
            }
          }}
        />
      </AdminForm>
    </AdminPageShell>
  );
}

function StaffFormFields({
  isNew,
  coachId,
  status,
  onDisable,
}: {
  isNew: boolean;
  coachId: string | null;
  status: "active" | "disabled";
  onDisable: () => Promise<void>;
}) {
  return (
    <>
      <FormSection title="Account" surface="card">
        <FormField name="name" label="Name" required>
          {(field) => <TextBinding {...field} />}
        </FormField>
        <FormField name="email" label="Email" required>
          {(field) => <TextBinding {...field} type="email" />}
        </FormField>
        <FormField
          name="role"
          label="Role"
          description="Authorisation only. Teaching is a capability, not a role."
          disabled
        >
          {(field) => (
            <ChoiceBinding
              {...field}
              as="native-select"
              options={STAFF_ROLES.map((role) => ({
                value: role,
                label: staffRoleLabel(role),
              }))}
            />
          )}
        </FormField>
        <p className="text-sm">Status: {staffStatusLabel(status)}</p>
        {status === "disabled" ? (
          <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
            Access is disabled.
          </p>
        ) : null}
        <FormField
          name="isCoach"
          label="This staff member is a coach"
          orientation="horizontal"
          description="Links or creates a teaching profile. Clearing the flag unlinks and deactivates the coach — sessions stay assigned."
        >
          {(field) => <BooleanBinding {...field} as="switch" />}
        </FormField>
        <StaffCoachProfileLink coachId={coachId} />
      </FormSection>
      <FormActions
        submitLabel="Save"
        cancelHref="/staff"
        destructive={
          isNew ? undefined : (
            <ConfirmAction
              triggerLabel="Disable Access"
              title="Disable staff access?"
              description="This staff account will no longer reach the admin portal. A linked coach goes inactive; assigned sessions stay in history."
              variant="outline"
              onConfirm={onDisable}
            />
          )
        }
      />
    </>
  );
}

function StaffCoachProfileLink({ coachId }: { coachId: string | null }) {
  const { watch } = useAdminFormContext<StaffFormValues>();
  const isCoach = watch("isCoach");
  if (!isCoach) return null;
  if (!coachId) {
    return (
      <p className="text-sm text-muted-foreground">
        A coach profile will be created or linked when you save.
      </p>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      Coach profile:{" "}
      <Link className="text-foreground underline underline-offset-4" href={`/coaches/${coachId}`}>
        Open linked coach
      </Link>
    </p>
  );
}
