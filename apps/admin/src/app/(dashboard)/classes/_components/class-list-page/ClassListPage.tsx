"use client";

import { type AdminClass, classPageHref, formatPeso } from "@balanse/domain";
import { Badge, buttonVariants } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import type { AdminDataTableRowAction } from "@/components/balanse/data-table/admin-data-table/AdminDataTable.meta";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { notify } from "@/modules/notifications/notify";
import { useClassCatalogue } from "../class-catalogue-provider/ClassCatalogueProvider";
import { ClassDatabaseAccess } from "../class-database-access/ClassDatabaseAccess";

export type ClassListPageProps = { empty?: boolean; loading?: boolean; error?: boolean };

const CLASS_DEFAULTS_NOTE =
  "Session values override class defaults. Duration and price here are catalogue defaults, not the live session values.";

function formatDuration(minutes: number | null): string {
  return minutes == null ? "—" : `${minutes} min`;
}

function formatPrice(amount: number | null): string {
  return amount == null ? "—" : formatPeso(amount);
}

export function ClassListPage({ empty, loading, error }: ClassListPageProps) {
  const catalogue = useClassCatalogue();
  const classesQuery = useSuspenseQuery(catalogue.query);
  const upsert = catalogue.mutation;
  const coaches = classesQuery.data.coaches;
  const canSave = classesQuery.data.canSave;
  const rows = empty ? [] : classesQuery.data.classes;

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
        meta: { primaryLink: (row) => `/classes/${row.id}`, mobile: { role: "title" } },
      },
      {
        accessorKey: "shortDescription",
        header: "Short description",
        meta: { mobile: { role: "subtitle" } },
        cell: ({ row }) => (
          <span className="block max-w-[18rem] truncate" title={row.original.shortDescription}>
            {row.original.shortDescription}
          </span>
        ),
      },
      {
        id: "coaches",
        header: "Assigned coaches",
        accessorFn: (row) =>
          row.coachIds
            .map((id) => coaches.find((coach) => coach.id === id)?.name ?? "Coach")
            .join(", "),
        meta: { mobile: { role: "meta" } },
      },
      {
        id: "marketing",
        header: "Marketing page",
        meta: { mobile: { role: "meta" } },
        cell: ({ row }) => (
          <a
            href={
              (process.env.NEXT_PUBLIC_MARKETING_URL ?? "http://localhost:9000") +
              classPageHref(row.original)
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline underline-offset-4"
          >
            {classPageHref(row.original)}
            {row.original.customPageUrl ? " ↗ Custom page" : ""}
          </a>
        ),
      },
      {
        id: "duration",
        header: "Duration",
        accessorFn: (row) => row.defaultDurationMinutes,
        meta: { mobile: { role: "meta" } },
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatDuration(row.original.defaultDurationMinutes)}
          </span>
        ),
      },
      {
        id: "price",
        header: "Price",
        accessorFn: (row) => row.defaultPricePhp,
        meta: { mobile: { role: "meta" } },
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <span className="tabular-nums">{formatPrice(row.original.defaultPricePhp)}</span>
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
    [coaches],
  );

  const rowActions = useCallback(
    (row: AdminClass): AdminDataTableRowAction<AdminClass>[] =>
      !canSave
        ? [{ id: "edit", label: "View editor", href: `/classes/${row.id}` }]
        : [
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
                  slug: `${row.slug}-copy-${Date.now().toString(36)}`,
                  description: row.description,
                  coachIds: row.coachIds,
                  heroImage: row.heroImage,
                  galleryImages: row.galleryImages,
                  shortDescription: row.shortDescription,
                  defaultDurationMinutes: row.defaultDurationMinutes,
                  defaultPricePhp: row.defaultPricePhp,
                  active: false,
                  customPageUrl: null,
                });
              },
            },
            {
              id: "toggle-active",
              label: row.active ? "Deactivate" : "Activate",
              onClick: () => {
                void saveClass({
                  id: row.id,
                  slug: row.slug,
                  description: row.description,
                  coachIds: row.coachIds,
                  heroImage: row.heroImage,
                  galleryImages: row.galleryImages,
                  name: row.name,
                  shortDescription: row.shortDescription,
                  defaultDurationMinutes: row.defaultDurationMinutes,
                  defaultPricePhp: row.defaultPricePhp,
                  active: !row.active,
                  customPageUrl: row.customPageUrl,
                });
              },
            },
          ],
    [saveClass, canSave],
  );

  return (
    <AdminPageShell
      className="min-w-0 [&>div]:min-w-0"
      title="Classes"
      actions={
        <Link href="/classes/new" className={buttonVariants()}>
          Add Class
        </Link>
      }
    >
      <div className="mb-4">
        <ClassDatabaseAccess
          canSave={canSave}
          connect={catalogue.connect}
          disconnect={catalogue.disconnect}
          onConnected={() => void classesQuery.refetch()}
        />
      </div>
      <p className="max-w-2xl text-sm text-muted-foreground">{CLASS_DEFAULTS_NOTE}</p>
      <div className="mt-4 min-w-0 max-w-full overflow-x-auto">
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
