"use client";

import { type AdminStaffRole, roleLabel } from "@balanse/domain";
import { Badge, Button, FeedbackState, TablePageSkeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useHasPermission } from "@/lib/auth/use-staff-permissions";
import { adminStaffRolesQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export type RoleListPageProps = {
  empty?: boolean;
  loading?: boolean;
  error?: boolean;
};

export function RoleListPage({ empty, loading, error }: RoleListPageProps) {
  const router = useRouter();
  const canRead = useHasPermission("roles.read");
  const canManage = useHasPermission("roles.manage");
  const { principal } = useMockPrincipal();
  const query = useQuery(adminStaffRolesQuery(principal));

  const rows = empty ? [] : (query.data ?? []);

  const columns = useMemo<ColumnDef<AdminStaffRole, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: { primaryLink: (row) => `/staff/roles/${row.id}`, mobile: { role: "title" } },
        cell: ({ row }) => roleLabel(row.original.key, row.original.name),
      },
      {
        id: "kind",
        header: "Type",
        accessorFn: (row) => (row.builtIn ? "Built-in" : "Custom"),
        enableColumnFilter: true,
        meta: { enableFaceting: true, facetLabel: "Type", mobile: { role: "subtitle" } },
        cell: ({ row }) => (
          <Badge variant={row.original.builtIn ? "info" : "neutral"} appearance="soft" size="sm">
            {row.original.builtIn ? "Built-in · protected" : "Custom"}
          </Badge>
        ),
      },
      {
        id: "status",
        header: "State",
        accessorFn: (row) => (row.status === "archived" ? "Archived" : "Active"),
        enableColumnFilter: true,
        meta: { enableFaceting: true, facetLabel: "State", mobile: { role: "status" } },
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === "archived" ? "danger" : "success"}
            appearance="solid"
            size="sm"
            dot
          >
            {row.original.status === "archived" ? "Archived" : "Active"}
          </Badge>
        ),
      },
      {
        id: "assigned",
        header: "Assigned staff",
        accessorFn: (row) => row.assignedStaffCount,
        meta: { mobile: { role: "meta" } },
      },
      {
        id: "permissions",
        header: "Permissions",
        accessorFn: (row) => row.permissionCount,
        meta: { mobile: { role: "meta" } },
      },
      {
        id: "action",
        header: "Action",
        enableSorting: false,
        meta: { mobile: { role: "hidden" } },
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-3">
            <Link className="underline underline-offset-4" href={`/staff/roles/${row.original.id}`}>
              {row.original.builtIn ? "View" : "Edit"}
            </Link>
            {canManage ? (
              <Link
                className="underline underline-offset-4"
                href={`/staff/roles/new?from=${row.original.id}`}
              >
                Clone
              </Link>
            ) : null}
          </div>
        ),
      },
    ],
    [canManage],
  );

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

  if (loading || (query.isPending && !query.data)) {
    return (
      <AdminPageShell
        title="Roles"
        breadcrumb={[{ label: "Staff", href: "/staff" }, { label: "Roles" }]}
      >
        <TablePageSkeleton label="Loading roles" rows={4} columns={6} />
      </AdminPageShell>
    );
  }

  if (error || query.isError) {
    return (
      <AdminPageShell
        title="Roles"
        breadcrumb={[{ label: "Staff", href: "/staff" }, { label: "Roles" }]}
      >
        <FeedbackState
          id="admin.roles-load-failed"
          className="mt-6"
          onAction={() => void query.refetch()}
        />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Roles"
      breadcrumb={[{ label: "Staff", href: "/staff" }, { label: "Roles" }]}
      actions={
        canManage ? (
          <Button nativeButton={false} render={<Link href="/staff/roles/new" />}>
            Create role
          </Button>
        ) : undefined
      }
    >
      <p className="max-w-2xl text-sm text-muted-foreground">
        Built-in Super Admin, Front Desk, and Coach stay protected. Custom roles are checklists from
        the canonical permission registry. Role is not the same as “this staff member is a coach.”
      </p>
      {rows.length === 0 ? (
        <FeedbackState
          id="admin.no-roles"
          className="mt-6"
          onAction={canManage ? () => router.push("/staff/roles/new") : undefined}
        />
      ) : (
        <div className="mt-4">
          <AdminDataTable
            tableId="staff-roles"
            data={rows}
            columns={columns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search roles"
          />
        </div>
      )}
    </AdminPageShell>
  );
}
