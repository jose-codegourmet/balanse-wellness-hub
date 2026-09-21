"use client";

import {
  ADMIN_ROLE_CAPABILITY_NOTE,
  type AdminStaff,
  staffCapabilityLabel,
  staffCoachFacetLabel,
  staffStatusLabel,
} from "@balanse/domain";
import { Badge, Button, FeedbackState } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";
import { CoachOption } from "@/components/balanse/coach/coach-option/CoachOption";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminCoachesQuery, adminStaffQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import type { StaffListPageProps } from "./StaffListPage.schema";

export function StaffListPage({ empty }: StaffListPageProps) {
  const { principal } = useMockPrincipal();
  const query = useSuspenseQuery(adminStaffQuery(principal.role));
  const coachesQuery = useSuspenseQuery(adminCoachesQuery(principal.role));
  const rows = empty ? [] : query.data;

  const columns = useMemo<ColumnDef<AdminStaff, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: { primaryLink: (row) => `/staff/${row.id}`, mobile: { role: "title" } },
        cell: ({ row }) => {
          const coach = row.original.coachId
            ? coachesQuery.data?.find((item) => item.id === row.original.coachId)
            : undefined;
          return (
            <span className="flex min-w-0 items-center gap-2">
              {coach ? <CoachOption coach={coach} /> : null}
              <span className="truncate">{row.original.name}</span>
            </span>
          );
        },
      },
      {
        id: "role",
        header: "Role",
        accessorFn: (row) => staffCapabilityLabel(row),
        meta: { mobile: { role: "subtitle" } },
      },
      {
        id: "coach",
        header: "Coach",
        accessorFn: (row) => staffCoachFacetLabel(row.isCoach),
        enableColumnFilter: true,
        enableGlobalFilter: false,
        meta: { enableFaceting: true, facetLabel: "Coach", mobile: { role: "status" } },
        cell: ({ row }) =>
          row.original.isCoach ? (
            <Badge variant="info" appearance="soft" size="sm">
              {staffCoachFacetLabel(true)}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => staffStatusLabel(row.status),
        enableColumnFilter: true,
        meta: { enableFaceting: true, facetLabel: "Status", mobile: { role: "status" } },
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === "disabled" ? "danger" : "success"}
            appearance="solid"
            size="sm"
            dot
          >
            {staffStatusLabel(row.original.status)}
          </Badge>
        ),
      },
      {
        id: "action",
        header: "Action",
        enableSorting: false,
        meta: { mobile: { role: "hidden" } },
        cell: ({ row }) => (
          <Link className="underline underline-offset-4" href={`/staff/${row.original.id}`}>
            View/Edit
          </Link>
        ),
      },
    ],
    [coachesQuery.data],
  );

  return (
    <AdminPageShell
      title="Staff Management"
      actions={
        <Button nativeButton={false} render={<Link href="/staff/new" />}>
          Add Staff
        </Button>
      }
    >
      <p className="max-w-2xl text-sm text-muted-foreground">{ADMIN_ROLE_CAPABILITY_NOTE}</p>
      {rows.length === 0 ? (
        <FeedbackState id="admin.no-staff" className="mt-6" />
      ) : (
        <div className="mt-4">
          <AdminDataTable
            tableId="staff"
            data={rows}
            columns={columns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search staff"
          />
        </div>
      )}
    </AdminPageShell>
  );
}
