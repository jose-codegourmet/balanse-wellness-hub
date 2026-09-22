"use client";

import { FeedbackState, FormPageSkeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useHasPermission } from "@/lib/auth/use-staff-permissions";
import { useArchiveAdminStaffRole, useUpsertAdminStaffRole } from "@/lib/query/mutations";
import { adminStaffRoleQuery, adminStaffRolesQuery } from "@/lib/query/queries";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { RoleForm } from "../role-form/RoleForm";
import { roleFormDefaultValues, roleFormValuesFrom } from "../role-form/RoleForm.defaults";

export type RoleFormPageProps = {
  roleId: string;
  cloneSourceId?: string;
};

export function RoleFormPage({ roleId, cloneSourceId }: RoleFormPageProps) {
  const router = useRouter();
  const isNew = roleId === "new";
  const canRead = useHasPermission("roles.read");
  const canManage = useHasPermission("roles.manage");
  const { principal } = useMockPrincipal();
  const rolesQuery = useQuery(adminStaffRolesQuery(principal));
  const roleQuery = useQuery({
    ...adminStaffRoleQuery(principal, isNew ? (cloneSourceId ?? "") : roleId),
    enabled: Boolean(!isNew || cloneSourceId),
  });
  const upsert = useUpsertAdminStaffRole();
  const archive = useArchiveAdminStaffRole();

  if (!canRead && !canManage) {
    return (
      <AdminPageShell
        title="Roles"
        breadcrumb={[{ label: "Staff", href: "/staff" }, { label: "Roles" }]}
      >
        <FeedbackState id="admin.roles-forbidden" className="mt-6" />
      </AdminPageShell>
    );
  }

  if ((isNew && cloneSourceId && roleQuery.isPending) || (!isNew && roleQuery.isPending)) {
    return (
      <AdminPageShell
        title={isNew ? "Create role" : "Role"}
        breadcrumb={[
          { label: "Staff", href: "/staff" },
          { label: "Roles", href: "/staff/roles" },
          { label: isNew ? "New" : roleId },
        ]}
      >
        <FormPageSkeleton label="Loading role" sections={2} fields={6} />
      </AdminPageShell>
    );
  }

  if (rolesQuery.isError || roleQuery.isError) {
    return (
      <AdminPageShell
        title="Role"
        breadcrumb={[
          { label: "Staff", href: "/staff" },
          { label: "Roles", href: "/staff/roles" },
        ]}
      >
        <FeedbackState
          id="admin.roles-load-failed"
          className="mt-6"
          onAction={() => {
            void rolesQuery.refetch();
            void roleQuery.refetch();
          }}
        />
      </AdminPageShell>
    );
  }

  const existing = isNew ? undefined : roleQuery.data;
  const cloneSource = cloneSourceId
    ? roleQuery.data?.id === cloneSourceId
      ? roleQuery.data
      : rolesQuery.data?.find((row) => row.id === cloneSourceId)
    : undefined;

  if (!isNew && roleQuery.data === null) {
    return (
      <AdminPageShell
        title="Role unavailable"
        breadcrumb={[
          { label: "Staff", href: "/staff" },
          { label: "Roles", href: "/staff/roles" },
        ]}
      >
        <FeedbackState id="admin.no-roles" className="mt-6" />
      </AdminPageShell>
    );
  }

  const defaultValues = existing
    ? roleFormValuesFrom(existing)
    : cloneSource
      ? roleFormValuesFrom({
          name: `Copy of ${cloneSource.name}`,
          description: cloneSource.description,
          permissionKeys: cloneSource.permissionKeys,
          cloneSourceId: cloneSource.id,
        })
      : roleFormDefaultValues;

  const title = isNew
    ? cloneSource
      ? `Clone ${cloneSource.name}`
      : "Create role"
    : (existing?.name ?? "Role");

  return (
    <AdminPageShell
      className="max-w-3xl"
      title={title}
      breadcrumb={[
        { label: "Staff", href: "/staff" },
        { label: "Roles", href: "/staff/roles" },
        { label: isNew ? "New" : (existing?.name ?? roleId) },
      ]}
    >
      <RoleForm
        key={`${existing?.id ?? cloneSource?.id ?? "new"}:${existing?.permissionCount ?? 0}`}
        defaultValues={defaultValues}
        builtIn={Boolean(existing?.builtIn) || (!canManage && !isNew)}
        cloneSourceName={cloneSource?.name ?? existing?.cloneSourceName}
        canArchive={Boolean(
          canManage && existing && !existing.builtIn && existing.assignedStaffCount === 0,
        )}
        onSubmit={async (values) => {
          try {
            const saved = await upsert.mutateAsync({
              id: isNew || existing?.builtIn ? undefined : existing?.id,
              name: values.name,
              description: values.description,
              permissionKeys: values.permissionKeys,
              cloneSourceId: values.cloneSourceId,
            });
            notify.admin("role.saved");
            router.push(`/staff/roles/${saved.id}`);
          } catch {
            notify.admin("role.save-failed");
          }
        }}
        onArchive={
          existing
            ? async () => {
                try {
                  await archive.mutateAsync(existing.id);
                  notify.admin("role.archived");
                  router.push("/staff/roles");
                } catch {
                  notify.admin("role.archive-failed");
                }
              }
            : undefined
        }
      />
    </AdminPageShell>
  );
}
