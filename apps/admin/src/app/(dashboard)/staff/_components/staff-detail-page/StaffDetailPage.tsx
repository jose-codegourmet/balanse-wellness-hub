"use client";

import {
  ADMIN_ROLE_CAPABILITY_NOTE,
  isSuperAdminRoleKey,
  staffStatusLabel,
  violatesLastSuperAdminInvariant,
} from "@balanse/domain";
import { FormPageSkeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useStaffActor } from "@/lib/auth/use-staff-permissions";
import { useDisableAdminStaff, useUpsertAdminStaff } from "@/lib/query/mutations";
import { adminStaffQuery, adminStaffRolesQuery } from "@/lib/query/queries";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import { BooleanBinding, ChoiceBinding, TextBinding } from "@/modules/admin/forms/bindings";
import { staffFormDefaultValues } from "@/modules/admin/forms/staff/staff-form.defaults";
import {
  type StaffFormValues,
  staffFormSchema,
} from "@/modules/admin/forms/staff/staff-form.schema";
import { useCanAdminAction } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { StaffRoleSummary } from "../staff-role-summary/StaffRoleSummary";
import {
  StaffRoleWarnings,
  staffRoleAssignmentBlockers,
} from "../staff-role-warnings/StaffRoleWarnings";
import type { StaffDetailPageProps } from "./StaffDetailPage.schema";

export function StaffDetailPage({ staffId }: StaffDetailPageProps) {
  const router = useRouter();
  const isNew = staffId === "new";
  const { principal } = useMockPrincipal();
  const canManageStaff = useCanAdminAction("staff-manage");
  const actor = useStaffActor();
  const query = useQuery(adminStaffQuery(principal));
  const rolesQuery = useQuery(adminStaffRolesQuery(principal));
  const upsert = useUpsertAdminStaff();
  const disable = useDisableAdminStaff();
  const existing = isNew ? undefined : query.data?.find((row) => row.id === staffId);

  if ((!isNew && query.isPending && !query.data) || (rolesQuery.isPending && !rolesQuery.data)) {
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
        roleId: existing.roleId,
        status: existing.status,
        isCoach: existing.isCoach,
      }
    : staffFormDefaultValues;

  const activeSuperAdminCount =
    query.data?.filter((row) => row.status === "active" && isSuperAdminRoleKey(row.roleKey))
      .length ?? 0;

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
        key={`${existing?.id ?? (isNew ? "new" : `pending-${staffId}`)}:${existing?.status ?? "active"}:${existing?.roleId ?? ""}`}
        id="staff-form"
        className="mt-6"
        schema={staffFormSchema}
        defaultValues={defaultValues}
        onSubmit={async (values) => {
          const role = rolesQuery.data?.find((item) => item.id === values.roleId);
          const blockers = staffRoleAssignmentBlockers({
            role,
            isCoach: values.isCoach,
            coachId: existing?.coachId ?? null,
            targetStaffId: isNew ? undefined : staffId,
            targetIsActiveSuperAdmin: Boolean(
              existing && existing.status === "active" && isSuperAdminRoleKey(existing.roleKey),
            ),
            activeSuperAdminCount,
            actor,
          });
          if (blockers.length > 0) {
            notify.admin("staff.save-failed");
            throw new Error(blockers[0]);
          }
          try {
            await upsert.mutateAsync({
              id: isNew ? undefined : staffId,
              name: values.name,
              email: values.email,
              role: "ADMIN",
              roleId: values.roleId,
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
          canManage={canManageStaff}
          coachId={existing?.coachId ?? null}
          staffId={isNew ? undefined : staffId}
          status={existing?.status ?? "active"}
          targetIsActiveSuperAdmin={Boolean(
            existing && existing.status === "active" && isSuperAdminRoleKey(existing.roleKey),
          )}
          activeSuperAdminCount={activeSuperAdminCount}
          disableBlocked={violatesLastSuperAdminInvariant({
            targetHoldsSuperAdmin: Boolean(
              existing && existing.status === "active" && isSuperAdminRoleKey(existing.roleKey),
            ),
            remainingActiveSuperAdminCount: activeSuperAdminCount,
            action: "disable",
          })}
          onDisable={async () => {
            if (
              violatesLastSuperAdminInvariant({
                targetHoldsSuperAdmin: Boolean(
                  existing && existing.status === "active" && isSuperAdminRoleKey(existing.roleKey),
                ),
                remainingActiveSuperAdminCount: activeSuperAdminCount,
                action: "disable",
              })
            ) {
              notify.admin("staff.disable-failed");
              throw new Error("The last active Super Admin cannot be disabled.");
            }
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
  canManage,
  staffId,
  coachId,
  status,
  targetIsActiveSuperAdmin,
  activeSuperAdminCount,
  disableBlocked,
  onDisable,
}: {
  isNew: boolean;
  canManage: boolean;
  staffId?: string;
  coachId: string | null;
  status: "active" | "disabled";
  targetIsActiveSuperAdmin: boolean;
  activeSuperAdminCount: number;
  disableBlocked: boolean;
  onDisable: () => Promise<void>;
}) {
  const { principal } = useMockPrincipal();
  const actor = useStaffActor();
  const rolesQuery = useQuery(adminStaffRolesQuery(principal));
  const { watch } = useAdminFormContext<StaffFormValues>();
  const roleId = watch("roleId");
  const isCoach = watch("isCoach");
  const activeRoles = (rolesQuery.data ?? []).filter((role) => role.status === "active");
  const selectedRole =
    activeRoles.find((role) => role.id === roleId) ??
    rolesQuery.data?.find((role) => role.id === roleId);

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
          name="roleId"
          label="Role"
          required
          description="Authorization only. This is not the same as “This staff member is a coach.”"
        >
          {(field) => (
            <ChoiceBinding
              {...field}
              as="native-select"
              options={activeRoles.map((role) => ({
                value: role.id,
                label: role.builtIn ? `${role.name} · built-in` : role.name,
              }))}
            />
          )}
        </FormField>
        <StaffRoleSummary role={selectedRole} />
        <StaffRoleWarnings
          role={selectedRole}
          isCoach={isCoach}
          coachId={coachId}
          targetStaffId={staffId}
          targetIsActiveSuperAdmin={targetIsActiveSuperAdmin}
          activeSuperAdminCount={activeSuperAdminCount}
          actor={actor}
        />
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
          description="Teaching capability, not a role. Links or creates a coach profile. Clearing the flag unlinks and deactivates the coach — sessions stay assigned."
        >
          {(field) => <BooleanBinding {...field} as="switch" />}
        </FormField>
        <StaffCoachProfileLink coachId={coachId} />
      </FormSection>
      {canManage ? (
        <FormActions
          submitLabel="Save"
          cancelHref="/staff"
          destructive={
            isNew ? undefined : disableBlocked ? (
              <p className="text-sm text-muted-foreground">
                The last active Super Admin cannot be disabled.
              </p>
            ) : (
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
      ) : (
        <FormActions submitLabel="Save" cancelHref="/staff" hideSubmit />
      )}
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
