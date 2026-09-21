"use client";

import {
  type AdminCoach,
  type AdminSession,
  coachRateTypeLabel,
  formatPeso,
} from "@balanse/domain";
import { Badge, Button, CoachPhoto, FeedbackState, TablePageSkeleton } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminNowIso } from "@/lib/clock";
import { useUpsertAdminCoach } from "@/lib/query/mutations";
import { adminCoachesQuery, adminSessionsQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export type CoachListPageProps = {
  empty?: boolean;
  loading?: boolean;
  error?: boolean;
  focusCoachId?: string;
  forceInactive?: boolean;
  extraSpecialties?: string[];
};

type CoachListRow = AdminCoach & { upcomingCount: number };

const specialtyFacetFilter: FilterFn<CoachListRow> = (row, _columnId, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  return filterValue.some((value) => row.original.specialties.includes(String(value)));
};

function countUpcoming(sessions: AdminSession[], coachId: string, nowIso: string): number {
  return sessions.filter(
    (session) =>
      session.coaches.some((coach) => coach.id === coachId) && session.startsAt >= nowIso,
  ).length;
}

export function CoachListPage({
  empty,
  loading,
  error,
  focusCoachId,
  forceInactive,
  extraSpecialties,
}: CoachListPageProps) {
  const { principal } = useMockPrincipal();
  const canSeeRates = principal.role === "admin";
  const coachesQuery = useSuspenseQuery(adminCoachesQuery(principal.role));
  const sessionsQuery = useSuspenseQuery(adminSessionsQuery(principal.role));
  const upsertCoach = useUpsertAdminCoach();
  const nowIso = adminNowIso();

  const rows = useMemo<CoachListRow[]>(() => {
    if (empty) return [];
    const sessions = sessionsQuery.data ?? [];
    return coachesQuery.data
      .filter((coach) => !focusCoachId || coach.id === focusCoachId)
      .map((coach) => ({
        ...coach,
        active: forceInactive ? false : coach.active,
        specialties: extraSpecialties
          ? [...coach.specialties, ...extraSpecialties]
          : coach.specialties,
        upcomingCount: countUpcoming(sessions, coach.id, nowIso),
      }));
  }, [
    coachesQuery.data,
    empty,
    extraSpecialties,
    focusCoachId,
    forceInactive,
    nowIso,
    sessionsQuery.data,
  ]);

  const columns = useMemo<ColumnDef<CoachListRow, unknown>[]>(() => {
    const photo: ColumnDef<CoachListRow, unknown> = {
      id: "photo",
      header: "Photo",
      enableSorting: false,
      enableGlobalFilter: false,
      enableHiding: false,
      meta: { mobile: { role: "hidden" } },
      cell: ({ row }) => (
        <CoachPhoto
          photoKey={row.original.photoKey}
          name={row.original.name}
          ratio="1:1"
          loading="lazy"
          className="size-10 rounded-full"
        />
      ),
    };

    const name: ColumnDef<CoachListRow, unknown> = {
      accessorKey: "name",
      header: "Name",
      meta: { primaryLink: (row) => `/coaches/${row.id}`, mobile: { role: "title" } },
    };

    const specialties: ColumnDef<CoachListRow, unknown> = {
      id: "specialties",
      header: "Specialties",
      accessorFn: (row) => row.specialties.join(" "),
      enableColumnFilter: true,
      filterFn: specialtyFacetFilter,
      getUniqueValues: (row) => row.specialties,
      meta: { enableFaceting: true, facetLabel: "Specialty", mobile: { role: "subtitle" } },
      cell: ({ row }) => (
        <div className="flex max-w-72 flex-wrap gap-1">
          {row.original.specialties.map((specialty) => (
            <Badge key={specialty} variant="neutral" appearance="soft" size="sm">
              {specialty}
            </Badge>
          ))}
        </div>
      ),
    };

    const status: ColumnDef<CoachListRow, unknown> = {
      id: "status",
      header: "Status",
      accessorFn: (row) => (row.active ? "Active" : "Inactive"),
      enableColumnFilter: true,
      enableGlobalFilter: false,
      meta: { enableFaceting: true, facetLabel: "Status", mobile: { role: "status" } },
      cell: ({ row }) => (
        <Badge
          variant={row.original.active ? "success" : "danger"}
          appearance="solid"
          size="sm"
          dot
        >
          {row.original.active ? "Active" : "Inactive"}
        </Badge>
      ),
    };

    const upcoming: ColumnDef<CoachListRow, unknown> = {
      accessorKey: "upcomingCount",
      header: "Upcoming sessions",
      enableGlobalFilter: false,
      meta: { mobile: { role: "meta" } },
    };

    const rate: ColumnDef<CoachListRow, unknown> = {
      id: "rate",
      header: "Rate",
      enableGlobalFilter: false,
      meta: { mobile: { role: "meta" } },
      accessorFn: (row) => `${formatPeso(row.defaultRatePhp)} ${coachRateTypeLabel(row.rateType)}`,
      cell: ({ row }) => (
        <span>
          {formatPeso(row.original.defaultRatePhp)} · {coachRateTypeLabel(row.original.rateType)}
        </span>
      ),
    };

    return canSeeRates
      ? [photo, name, specialties, status, upcoming, rate]
      : [photo, name, specialties, status, upcoming];
  }, [canSeeRates]);

  return (
    <AdminPageShell
      title="Coaches"
      actions={
        <Button nativeButton={false} render={<Link href="/coaches/new" />}>
          Add Coach
        </Button>
      }
    >
      {loading ? (
        <TablePageSkeleton
          label="Loading coaches"
          rows={6}
          columns={canSeeRates ? 7 : 6}
          leadingCell="avatar"
        />
      ) : error ? (
        <FeedbackState
          id="calendar.load-failed"
          className="mt-6"
          title="Could not load coaches"
          description="The mock harness failed this request. Retry after clearing failNext."
        />
      ) : (
        <AdminDataTable
          tableId="coaches"
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          persistUrl
          pageSize={25}
          searchPlaceholder="Search coaches"
          emptyStateId="admin.no-coaches"
          emptyFilterLabel="No coaches match your filter."
          rowActions={(row) => [
            { id: "edit", label: "Edit", href: `/coaches/${row.id}` },
            {
              id: row.active ? "deactivate" : "activate",
              label: row.active ? "Deactivate" : "Activate",
              onClick: (current) => {
                void upsertCoach.mutateAsync({
                  id: current.id,
                  name: current.name,
                  specialties: current.specialties,
                  shortBio: current.shortBio,
                  photoKey: current.photoKey,
                  active: !current.active,
                  defaultRatePhp: current.defaultRatePhp,
                  rateType: current.rateType,
                });
              },
            },
          ]}
        />
      )}
    </AdminPageShell>
  );
}
