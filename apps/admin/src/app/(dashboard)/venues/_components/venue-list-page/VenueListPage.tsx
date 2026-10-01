"use client";

import { type AdminVenue, venueKindLabel, venueOperationLabel } from "@balanse/domain";
import { Badge, Button } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminNowIso } from "@/lib/clock";
import { useUpsertAdminVenue } from "@/lib/query/mutations";
import { adminSessionsQuery, adminVenuesQuery } from "@/lib/query/queries";
import { AdminCan, useCanAdminAction } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import type { VenueListPageProps } from "./VenueListPage.meta";

type VenueRow = AdminVenue & { upcomingCount: number };

export function VenueListPage({ empty = false }: VenueListPageProps) {
  const { principal } = useMockPrincipal();
  const canManage = useCanAdminAction("venues-manage");
  const venuesQuery = useSuspenseQuery(adminVenuesQuery(principal));
  const sessionsQuery = useSuspenseQuery(adminSessionsQuery(principal));
  const upsert = useUpsertAdminVenue();
  const nowIso = adminNowIso();

  const rows = useMemo<VenueRow[]>(() => {
    if (empty) return [];
    return venuesQuery.data.map((venue) => ({
      ...venue,
      upcomingCount: sessionsQuery.data.filter(
        (session) =>
          session.venueId === venue.id &&
          session.startsAt >= nowIso &&
          session.status !== "CANCELLED",
      ).length,
    }));
  }, [empty, nowIso, sessionsQuery.data, venuesQuery.data]);

  const columns = useMemo<ColumnDef<VenueRow, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        // The name opens the edit page for staff who can manage venues.
        meta: {
          primaryLink: canManage ? (row) => `/venues/${row.id}` : undefined,
          mobile: { role: "title" },
        },
      },
      {
        id: "kind",
        header: "Type",
        accessorFn: (row) => venueKindLabel(row.kind),
        enableColumnFilter: true,
        enableGlobalFilter: false,
        meta: { enableFaceting: true, facetLabel: "Type", mobile: { role: "meta" } },
        cell: ({ row }) => (
          <Badge
            variant={row.original.kind === "OFFSITE" ? "accent" : "neutral"}
            appearance="soft"
            size="sm"
          >
            {venueKindLabel(row.original.kind)}
          </Badge>
        ),
      },
      {
        id: "operation",
        header: "Operation",
        accessorFn: (row) => venueOperationLabel(row.studioOwned),
        enableColumnFilter: true,
        enableGlobalFilter: false,
        meta: { enableFaceting: true, facetLabel: "Operation", mobile: { role: "meta" } },
        cell: ({ row }) => (
          <Badge
            variant={row.original.studioOwned ? "success" : "neutral"}
            appearance="soft"
            size="sm"
          >
            {venueOperationLabel(row.original.studioOwned)}
          </Badge>
        ),
      },
      {
        accessorKey: "address",
        header: "Address",
        meta: { mobile: { role: "subtitle" } },
        // line-clamp instead of truncate: truncate is nowrap, which makes max-w the column's
        // minimum width and pushes the whole table into horizontal scroll (or cards).
        cell: ({ row }) => (
          <span
            className="line-clamp-2 max-w-80 text-muted-foreground"
            title={row.original.address || undefined}
          >
            {row.original.address || "—"}
          </span>
        ),
      },
      {
        accessorKey: "openingHours",
        header: "Hours",
        meta: { mobile: { role: "meta" } },
        cell: ({ row }) => (
          <span
            className="line-clamp-2 max-w-56 text-muted-foreground"
            title={row.original.openingHours || undefined}
          >
            {row.original.openingHours || "Hours not set"}
          </span>
        ),
      },
      {
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
      },
      {
        accessorKey: "upcomingCount",
        header: "Upcoming",
        enableGlobalFilter: false,
        meta: { mobile: { role: "meta" } },
      },
    ],
    [canManage],
  );

  const branches = rows.filter((row) => row.kind === "BRANCH" && row.active).length;
  const studioOwned = rows.filter((row) => row.studioOwned && row.active).length;
  const thirdParty = rows.filter((row) => row.studioOwned === false && row.active).length;
  const offsiteUpcoming = rows
    .filter((row) => row.kind === "OFFSITE")
    .reduce((total, row) => total + row.upcomingCount, 0);

  function toggleActive(venue: VenueRow) {
    const { upcomingCount: _count, ...current } = venue;
    void upsert
      .mutateAsync({
        ...current,
        openingHours: current.openingHours ?? "",
        studioOwned: current.studioOwned ?? false,
        active: !current.active,
      })
      .then(() => notify.admin("venue.saved"))
      .catch(() => notify.admin("venue.save-failed"));
  }

  return (
    <AdminPageShell
      eyebrow="Studio"
      title="Venues"
      description="The locations that host your sessions. Keep staff hours and whether each location is studio-operated or third-party in one clear directory."
      stats={
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Active branches</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{branches}</dd>
          </div>
          <div className="border-l border-border pl-3 sm:pl-5">
            <dt className="text-xs font-medium text-muted-foreground">Studio-owned</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{studioOwned}</dd>
          </div>
          <div className="border-l border-border pl-3 sm:pl-5">
            <dt className="text-xs font-medium text-muted-foreground">Third-party</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{thirdParty}</dd>
          </div>
          <div className="border-l border-border pl-3 sm:pl-5">
            <dt className="text-xs font-medium text-muted-foreground">Upcoming off-site</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{offsiteUpcoming}</dd>
          </div>
        </dl>
      }
      actions={
        <AdminCan action="venues-manage">
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 shadow-sm">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-foreground">New location</p>
              <p className="text-xs text-muted-foreground">Add a branch or partner</p>
            </div>
            <Button nativeButton={false} render={<Link href="/venues/new" />}>
              <PlusIcon aria-hidden />
              Add venue
            </Button>
          </div>
        </AdminCan>
      }
    >
      <AdminDataTable
        tableId="venues"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        persistUrl
        pageSize={25}
        searchPlaceholder="Search venues"
        emptyStateId="admin.no-venues"
        emptyFilterLabel="No venues match your filter."
        rowActions={
          canManage
            ? (row) => [
                { id: "edit", label: "Edit", href: `/venues/${row.id}` },
                {
                  id: row.active ? "deactivate" : "activate",
                  label: row.active ? "Deactivate" : "Activate",
                  onClick: toggleActive,
                },
              ]
            : undefined
        }
      />
    </AdminPageShell>
  );
}
