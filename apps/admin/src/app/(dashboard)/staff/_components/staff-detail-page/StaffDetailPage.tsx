"use client";

import { ApiError } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import {
  ADMIN_ROLE_CAPABILITY_NOTE,
  isSuperAdminRoleKey,
  splitFullName,
  staffStatusLabel,
  violatesLastSuperAdminInvariant,
} from "@balanse/domain";
import { FormPageSkeleton, UserAvatar } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { StaffPhotoCard } from "@/components/balanse/staff-photo-card/StaffPhotoCard";
import { useStaffActor } from "@/lib/auth/use-staff-permissions";
import { useDisableAdminStaff, useUpsertAdminStaff } from "@/lib/query/mutations";
import { adminCoachesQuery, adminStaffQuery, adminStaffRolesQuery } from "@/lib/query/queries";
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
import { StaffAccountActions } from "../staff-account-actions/StaffAccountActions";
import { StaffInviteDialog } from "../staff-invite-dialog/StaffInviteDialog";
import { StaffRoleSummary } from "../staff-role-summary/StaffRoleSummary";
import {
  StaffRoleWarnings,
  staffRoleAssignmentBlockers,
} from "../staff-role-warnings/StaffRoleWarnings";
import type { StaffDetailPageProps } from "./StaffDetailPage.schema";

export function StaffDetailPage({ staffId }: StaffDetailPageProps) {
  const router = useRouter();
  const isNew = staffId === "new";
  const [invitation, setInvitation] = useState<{
    staffName: string;
    inviteUrl: string | null;
  } | null>(null);
  const actor = useStaffActor();
  const canManageStaff = useCanAdminAction("staff-manage");
  const canManageRoles = useCanAdminAction("roles-manage");
  const query = useQuery(adminStaffQuery(actor, apiFetchBrowser));
  const rolesQuery = useQuery(adminStaffRolesQuery(actor, apiFetchBrowser));
  const coachesQuery = useQuery({
    ...adminCoachesQuery(actor, apiFetchBrowser),
    enabled: canManageStaff,
  });
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
        coachId: existing.coachId,
      }
    : staffFormDefaultValues;

  const activeSuperAdminCount =
    query.data?.filter((row) => row.status === "active" && isSuperAdminRoleKey(row.roleKey))
      .length ?? 0;

  return (
    <AdminPageShell
      className="max-w-5xl"
      eyebrow="Team access"
      title={isNew ? "Add staff member" : (existing?.name ?? "Staff detail")}
      leading={
        existing ? (
          <UserAvatar
            name={splitFullName(existing.name)}
            avatarUrl={existing.avatarUrl}
            seed={existing.id}
            size="xl"
          />
        ) : undefined
      }
      subtitle={
        existing ? (
          <span className="text-sm text-muted-foreground">
            {existing.roleName} · {staffStatusLabel(existing.status)}
          </span>
        ) : undefined
      }
      actions={
        existing && canManageStaff ? (
          <StaffAccountActions
            key={existing.id}
            staffId={existing.id}
            staffName={existing.name}
            disabled={
              existing.status !== "active" ||
              rolesQuery.data?.find((role) => role.id === existing.roleId)?.status !== "active"
            }
          />
        ) : undefined
      }
      description={
        isNew
          ? "Add a staff member and copy a private invite link to share with them. No invitation email will be sent."
          : `Manage ${existing?.name ?? "this staff member"}'s account status and studio access.`
      }
      breadcrumb={[
        { label: "Staff", href: "/staff" },
        { label: isNew ? "Add Staff" : (existing?.name ?? staffId) },
      ]}
    >
      <p className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        {ADMIN_ROLE_CAPABILITY_NOTE}
      </p>
      <StaffPhotoCard
        key={staffId}
        staffId={existing?.id}
        name={existing?.name ?? "New staff"}
        avatarUrl={existing?.avatarUrl}
        canEdit={
          canManageStaff &&
          existing?.status === "active" &&
          rolesQuery.data?.find((role) => role.id === existing.roleId)?.status === "active"
        }
      />
      <AdminForm
        key={`${existing?.id ?? (isNew ? "new" : `pending-${staffId}`)}:${existing?.status ?? "active"}:${existing?.roleId ?? ""}`}
        id="staff-form"
        className="grid gap-6"
        schema={staffFormSchema}
        defaultValues={defaultValues}
        onSubmit={async (values) => {
          const role = rolesQuery.data?.find((item) => item.id === values.roleId);
          const blockers = staffRoleAssignmentBlockers({
            role,
            isCoach: values.isCoach,
            coachId: values.isCoach ? values.coachId : null,
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
            const result = await upsert.mutateAsync({
              id: isNew ? undefined : staffId,
              name: values.name,
              email: values.email,
              roleId: values.roleId,
              previousRoleId: existing?.roleId,
              coachId: values.isCoach ? values.coachId : null,
              previousCoachId: existing?.coachId,
            });
            notify.admin("staff.saved");
            if (actor?.staffId === staffId) router.refresh();
            upsert.reset();
            if (isNew) setInvitation({ staffName: result.staff.name, inviteUrl: result.inviteUrl });
            else router.push("/staff");
          } catch (error) {
            if (error instanceof ApiError && error.code === "last_super_admin_protected") {
              notify.warning({
                title: "Keep a Super Admin active",
                description: "Assign another active Super Admin before changing this role.",
              });
            } else {
              notify.admin("staff.save-failed");
            }
            throw error;
          }
        }}
      >
        <StaffFormFields
          isNew={isNew}
          canManage={canManageStaff}
          canManageRoles={canManageRoles}
          coachId={existing?.coachId ?? null}
          coaches={coachesQuery.data ?? []}
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
              if (error instanceof ApiError && error.code === "last_super_admin_protected") {
                notify.warning({
                  title: "Keep a Super Admin active",
                  description: "Assign another active Super Admin before disabling this account.",
                });
              } else {
                notify.admin("staff.disable-failed");
              }
              throw error;
            }
          }}
        />
      </AdminForm>
      {invitation ? (
        <StaffInviteDialog
          {...invitation}
          onClose={() => {
            setInvitation(null);
            router.replace("/staff");
          }}
        />
      ) : null}
    </AdminPageShell>
  );
}

function StaffFormFields({
  isNew,
  canManage,
  canManageRoles,
  staffId,
  coachId,
  coaches,
  status,
  targetIsActiveSuperAdmin,
  activeSuperAdminCount,
  disableBlocked,
  onDisable,
}: {
  isNew: boolean;
  canManage: boolean;
  canManageRoles: boolean;
  staffId?: string;
  coachId: string | null;
  coaches: Array<{ id: string; name: string; active: boolean; staffId: string | null }>;
  status: "active" | "disabled";
  targetIsActiveSuperAdmin: boolean;
  activeSuperAdminCount: number;
  disableBlocked: boolean;
  onDisable: () => Promise<void>;
}) {
  const actor = useStaffActor();
  const rolesQuery = useQuery(adminStaffRolesQuery(actor, apiFetchBrowser));
  const { watch } = useAdminFormContext<StaffFormValues>();
  const roleId = watch("roleId");
  const isCoach = watch("isCoach");
  const selectedCoachId = watch("coachId");
  const activeRoles = (rolesQuery.data ?? []).filter((role) => role.status === "active");
  const selectedRole =
    activeRoles.find((role) => role.id === roleId) ??
    rolesQuery.data?.find((role) => role.id === roleId);

  return (
    <>
      <FormSection title="Account" surface="card">
        <FormField name="name" label="Name" required disabled={!canManage}>
          {(field) => <TextBinding {...field} />}
        </FormField>
        <FormField name="email" label="Email" required disabled={!canManage}>
          {(field) => <TextBinding {...field} type="email" />}
        </FormField>
        <FormField
          name="roleId"
          label="Role"
          required
          disabled={!canManage || (!isNew && !canManageRoles)}
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
          coachId={selectedCoachId}
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
          disabled={!canManage}
          description="Teaching capability, not a role. Link an existing coach profile. Clearing the flag unlinks the profile; sessions stay assigned."
        >
          {(field) => <BooleanBinding {...field} as="switch" />}
        </FormField>
        {isCoach ? (
          <FormField
            name="coachId"
            label="Linked coach profile"
            required
            disabled={!canManage}
            description="Choose the teaching profile for this staff member. Teaching capability is separate from their authorization role."
          >
            {(field) => (
              <ChoiceBinding
                {...field}
                as="native-select"
                options={coaches
                  .filter((coach) => coach.staffId === null || coach.id === coachId)
                  .map((coach) => ({ value: coach.id, label: coach.name }))}
              />
            )}
          </FormField>
        ) : null}
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
                variant="destructive"
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
