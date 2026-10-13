"use client";

import { apiFetchBrowser } from "@balanse/api-client/browser";
import {
  type AdminBundle,
  type BundleCreditMetrics,
  bundleStatusLabel,
  EMPTY_BUNDLE_CREDIT_METRICS,
  formatPeso,
} from "@balanse/domain";
import { Badge, Button, FeedbackState, TablePageSkeleton } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useSetAdminBundleStatus } from "@/lib/query/mutations";
import {
  adminBundleAcquisitionsQuery,
  adminBundleMetricsQuery,
  adminBundlesQuery,
} from "@/lib/query/queries";
import { AdminCan, useCanAdminAction, useStaffActor } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";

export type BundleListPageProps = {
  empty?: boolean;
  loading?: boolean;
  error?: boolean;
};

/** Session credits across every customer who owns the package. */
const CREDIT_COLUMNS: { key: keyof BundleCreditMetrics; header: string }[] = [
  { key: "used", header: "Used" },
  { key: "held", header: "Held" },
  { key: "restored", header: "Restored" },
  { key: "granted", header: "Granted" },
];

function statusVariant(status: AdminBundle["status"]) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "ARCHIVED") return "danger" as const;
  return "neutral" as const;
}

export function BundleListPage({ empty, loading, error }: BundleListPageProps) {
  const actor = useStaffActor();
  const canManageBundles = useCanAdminAction("bundles-manage");
  const bundlesQuery = useSuspenseQuery(adminBundlesQuery(actor, apiFetchBrowser));
  const acquisitionsQuery = useSuspenseQuery(adminBundleAcquisitionsQuery(actor, apiFetchBrowser));
  const metricsQuery = useSuspenseQuery(adminBundleMetricsQuery(actor, apiFetchBrowser));
  const metrics = metricsQuery.data;
  const setStatus = useSetAdminBundleStatus();

  const rows = useMemo(() => (empty ? [] : bundlesQuery.data), [bundlesQuery.data, empty]);
  const reviews = useMemo(
    () => (empty ? [] : acquisitionsQuery.data.filter((row) => row.status === "PENDING_REVIEW")),
    [acquisitionsQuery.data, empty],
  );

  const columns = useMemo<ColumnDef<AdminBundle, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: { primaryLink: (row) => `/bundles/${row.id}`, mobile: { role: "title" } },
      },
      {
        accessorKey: "sessionCreditCount",
        header: "Sessions",
        meta: { mobile: { role: "subtitle" } },
      },
      {
        id: "price",
        header: "Price",
        accessorFn: (row) => formatPeso(row.pricePhp),
        meta: { mobile: { role: "meta" } },
      },
      ...CREDIT_COLUMNS.map(
        ({ key, header }): ColumnDef<AdminBundle, unknown> => ({
          id: `credits-${key}`,
          header,
          accessorFn: (row) => (metrics[row.id] ?? row.metrics ?? EMPTY_BUNDLE_CREDIT_METRICS)[key],
          cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span>,
        }),
      ),
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => bundleStatusLabel(row.status),
        enableColumnFilter: true,
        meta: { enableFaceting: true, facetLabel: "Status", mobile: { role: "status" } },
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)} appearance="solid" size="sm" dot>
            {bundleStatusLabel(row.original.status)}
          </Badge>
        ),
      },
    ],
    [metrics],
  );

  return (
    <AdminPageShell
      eyebrow="Packages & credits"
      title="Bundles"
      description="Create session packages, control what customers can buy, and review paid acquisitions. Existing entitlements always keep their original snapshot."
      stats={
        <dl className="grid grid-cols-3 gap-3">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Published</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {rows.filter((row) => row.status === "PUBLISHED").length}
            </dd>
          </div>
          <div className="border-l border-border pl-3 sm:pl-5">
            <dt className="text-xs font-medium text-muted-foreground">Drafts</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {rows.filter((row) => row.status === "DRAFT").length}
            </dd>
          </div>
          <div className="border-l border-border pl-3 sm:pl-5">
            <dt className="text-xs font-medium text-muted-foreground">Needs review</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{reviews.length}</dd>
          </div>
        </dl>
      }
      actions={
        <AdminCan action="bundles-manage">
          <Button nativeButton={false} render={<Link href="/bundles/new" />}>
            Add package
          </Button>
        </AdminCan>
      }
    >
      {loading ? (
        <TablePageSkeleton label="Loading packages" rows={5} columns={4} />
      ) : error ? (
        <FeedbackState
          id="calendar.load-failed"
          className="mt-6"
          title="Could not load packages"
          description="The package service could not be reached. Please try again."
        />
      ) : (
        <AdminDataTable
          tableId="bundles"
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          persistUrl
          pageSize={25}
          searchPlaceholder="Search packages"
          emptyStateId="admin.no-bundles"
          emptyFilterLabel="No packages match your filter."
          rowActions={
            canManageBundles
              ? (row) => [
                  { id: "edit", label: "Edit", href: `/bundles/${row.id}` },
                  {
                    id: "publish",
                    label: row.status === "PUBLISHED" ? "Unpublish" : "Publish",
                    onClick: (current) => {
                      void setStatus
                        .mutateAsync({
                          id: current.id,
                          status: current.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                        })
                        .then(() => notify.admin("bundle.status-updated"))
                        .catch(() => notify.admin("bundle.status-failed"));
                    },
                  },
                  {
                    id: "archive",
                    label: row.status === "ARCHIVED" ? "Restore draft" : "Archive",
                    onClick: (current) => {
                      void setStatus
                        .mutateAsync({
                          id: current.id,
                          status: current.status === "ARCHIVED" ? "DRAFT" : "ARCHIVED",
                        })
                        .then(() => notify.admin("bundle.status-updated"))
                        .catch(() => notify.admin("bundle.status-failed"));
                    },
                  },
                ]
              : (row) => [{ id: "view", label: "View", href: `/bundles/${row.id}` }]
          }
        />
      )}

      <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card px-5 py-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Review queue
          </p>
          <h2 className="mt-1 font-display text-2xl">Paid package reviews</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {reviews.length === 0
              ? "No package payments are waiting. Receipts and counter payments are reviewed in Payments."
              : `${reviews.length} package payment${reviews.length === 1 ? "" : "s"} waiting. Receipts and counter payments are reviewed in Payments.`}
          </p>
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/payments?tab=packages" />}
        >
          Open package payments
        </Button>
      </section>
    </AdminPageShell>
  );
}
