"use client";

import { type AdminClass, formatPeso } from "@balanse/domain";
import { Badge, Button } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/AdminDataTable";
import type { AdminDataTableRowAction } from "@/components/balanse/data-table/AdminDataTable.schema";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { useUpsertAdminClass } from "@/lib/query/mutations";
import { adminClassesQuery, adminCoachesQuery } from "@/lib/query/queries";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

const CLASS_DEFAULTS_NOTE =
  "Session values override class defaults. Duration and price here are catalogue defaults, not the live session values.";

function formatDuration(minutes: number | null): string {
  return minutes == null ? "—" : `${minutes} min`;
}

function formatPrice(amount: number | null): string {
  return amount == null ? "—" : formatPeso(amount);
}

export function ClassListPage({
  empty,
  loading,
  error,
}: {
  empty?: boolean;
  loading?: boolean;
  error?: boolean;
}) {
  const { principal } = useMockPrincipal();
  const classesQuery = useSuspenseQuery(adminClassesQuery(principal.role));
  const coachesQuery = useSuspenseQuery(adminCoachesQuery(principal.role));
  const upsert = useUpsertAdminClass();
  const rows = empty ? [] : classesQuery.data;
  const coaches = coachesQuery.data;

  const coachName = useCallback(
    (id: string) => coaches.find((coach) => coach.id === id)?.name ?? id,
    [coaches],
  );

  const saveClass = useCallback(
    async (input: Parameters<typeof upsert.mutateAsync>[0]) => {
      try {
        await upsert.mutateAsync(input);
        notify.admin("class.saved");
      } catch {
        notify.admin("class.save-failed");
      }
    },
    [upsert],
  );

  const columns = useMemo<ColumnDef<AdminClass, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: { primaryLink: (row) => `/classes/${row.id}` },
      },
      {
        accessorKey: "shortDescription",
        header: "Short description",
        cell: ({ row }) => (
          <span className="block max-w-[18rem] truncate" title={row.original.shortDescription}>
            {row.original.shortDescription}
          </span>
        ),
      },
      {
        id: "duration",
        header: "Duration",
        accessorFn: (row) => row.defaultDurationMinutes,
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <span className="tabular-nums">{formatDuration(row.original.defaultDurationMinutes)}</span>
        ),
      },
      {
        id: "price",
        header: "Price",
        accessorFn: (row) => row.defaultPricePhp,
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <span className="tabular-nums">{formatPrice(row.original.defaultPricePhp)}</span>
        ),
      },
      {
        id: "coaches",
        header: "Coaches",
        accessorFn: (row) => row.associatedCoachIds.map(coachName).join(", "),
        enableColumnFilter: true,
        enableGlobalFilter: false,
        meta: { enableFaceting: true, facetLabel: "Coach" },
        filterFn: (row, _columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
          const names = row.original.associatedCoachIds.map(coachName);
          return filterValue.some((value) => names.includes(String(value)));
        },
        getFacetedUniqueValues: () => () => {
          const counts = new Map<string, number>();
          for (const row of rows) {
            for (const id of row.associatedCoachIds) {
              const name = coachName(id);
              counts.set(name, (counts.get(name) ?? 0) + 1);
            }
          }
          return counts;
        },
        cell: ({ row }) => {
          const names = row.original.associatedCoachIds.map(coachName);
          if (names.length === 0) return "—";
          const label = names.join(", ");
          return (
            <span className="block max-w-[16rem] truncate" title={label}>
              {label}
            </span>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => (row.active ? "Active" : "Inactive"),
        enableColumnFilter: true,
        enableGlobalFilter: false,
        meta: { enableFaceting: true, facetLabel: "Status" },
        cell: ({ row }) => (
          <Badge
            variant={row.original.active ? "success" : "neutral"}
            appearance="solid"
            size="sm"
            dot
          >
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    [coachName, rows],
  );

  const rowActions = useCallback(
    (row: AdminClass): AdminDataTableRowAction<AdminClass>[] => [
      {
        id: "edit",
        label: "Edit",
        href: `/classes/${row.id}`,
      },
      {
        id: "duplicate",
        label: "Duplicate",
        onClick: () => {
          void saveClass({
            name: `${row.name} (copy)`,
            shortDescription: row.shortDescription,
            defaultDurationMinutes: row.defaultDurationMinutes,
            defaultPricePhp: row.defaultPricePhp,
            active: row.active,
            associatedCoachIds: row.associatedCoachIds,
          });
        },
      },
      {
        id: "toggle-active",
        label: row.active ? "Deactivate" : "Activate",
        onClick: () => {
          void saveClass({
            id: row.id,
            name: row.name,
            shortDescription: row.shortDescription,
            defaultDurationMinutes: row.defaultDurationMinutes,
            defaultPricePhp: row.defaultPricePhp,
            active: !row.active,
            associatedCoachIds: row.associatedCoachIds,
          });
        },
      },
    ],
    [saveClass],
  );

  return (
    <AdminPageShell
      title="Classes"
      actions={
        <Button nativeButton={false} render={<Link href="/classes/new" />}>
          Add Class
        </Button>
      }
    >
      <p className="max-w-2xl text-sm text-muted-foreground">{CLASS_DEFAULTS_NOTE}</p>
      <div className="mt-4">
        <AdminDataTable
          tableId="classes"
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          searchPlaceholder="Search classes"
          emptyStateId="admin.no-classes"
          persistUrl
          loading={loading}
          loadingLabel="Loading classes"
          error={
            error ? (
              <p className="text-sm text-muted-foreground">Classes could not be loaded.</p>
            ) : undefined
          }
          rowActions={rowActions}
        />
      </div>
    </AdminPageShell>
  );
}
