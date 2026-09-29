"use client";

import { type AdminVenue, venueKindLabel } from "@balanse/domain";
import { Badge, Button } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminNowIso } from "@/lib/clock";
import { useUpsertAdminVenue } from "@/lib/query/mutations";
import { adminSessionsQuery, adminVenuesQuery } from "@/lib/query/queries";
import { AdminCan, useCanAdminAction } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { VenueFormDialog } from "../venue-form-dialog/VenueFormDialog";
import type { VenueListPageProps } from "./VenueListPage.meta";

type VenueRow = AdminVenue & { upcomingCount: number };

export function VenueListPage({ empty = false, previewCreate = false }: VenueListPageProps) {
  const { principal } = useMockPrincipal();
  const canManage = useCanAdminAction("venues-manage");
  const venuesQuery = useSuspenseQuery(adminVenuesQuery(principal));
  const sessionsQuery = useSuspenseQuery(adminSessionsQuery(principal));
  const upsert = useUpsertAdminVenue();
  const [dialog, setDialog] = useState<{ venue: AdminVenue | null } | null>(
    previewCreate ? { venue: null } : null,
  );
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
        meta: { mobile: { role: "title" } },
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
        accessorKey: "address",
        header: "Address",
        meta: { mobile: { role: "subtitle" } },
        cell: ({ row }) => (
          <span className="block max-w-80 truncate text-muted-foreground">
            {row.original.address || "—"}
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
        header: "Upcoming sessions",
        enableGlobalFilter: false,
        meta: { mobile: { role: "meta" } },
      },
    ],
    [],
  );

  const branches = rows.filter((row) => row.kind === "BRANCH" && row.active).length;
  const offsite = rows.filter((row) => row.kind === "OFFSITE" && row.active).length;
  const offsiteUpcoming = rows
    .filter((row) => row.kind === "OFFSITE")
    .reduce((total, row) => total + row.upcomingCount, 0);

  function toggleActive(venue: VenueRow) {
    const { upcomingCount: _count, ...current } = venue;
    void upsert
      .mutateAsync({ ...current, active: !current.active })
      .then(() => notify.admin("venue.saved"))
      .catch(() => notify.admin("venue.save-failed"));
  }

  return (
    <AdminPageShell
      eyebrow="Studio"
      title="Venues"
      description="Where sessions happen. Add a branch when the studio grows, or an off-site venue for events like a resort morning. Sessions can share a time and a venue; how you use the space is up to you."
      stats={
        <dl className="grid grid-cols-3 gap-3">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Active branches</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{branches}</dd>
          </div>
          <div className="border-l border-border pl-3 sm:pl-5">
            <dt className="text-xs font-medium text-muted-foreground">Off-site venues</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{offsite}</dd>
          </div>
          <div className="border-l border-border pl-3 sm:pl-5">
            <dt className="text-xs font-medium text-muted-foreground">Upcoming off-site</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{offsiteUpcoming}</dd>
          </div>
        </dl>
      }
      actions={
        <AdminCan action="venues-manage">
          <Button type="button" onClick={() => setDialog({ venue: null })}>
            <PlusIcon aria-hidden />
            Add venue
          </Button>
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
                {
                  id: "edit",
                  label: "Edit",
                  onClick: (current) => {
                    const { upcomingCount: _count, ...venue } = current;
                    setDialog({ venue });
                  },
                },
                {
                  id: row.active ? "deactivate" : "activate",
                  label: row.active ? "Deactivate" : "Activate",
                  onClick: toggleActive,
                },
              ]
            : undefined
        }
      />
      {canManage ? (
        <VenueFormDialog
          open={dialog !== null}
          venue={dialog?.venue ?? null}
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
        />
      ) : null}
    </AdminPageShell>
  );
}
