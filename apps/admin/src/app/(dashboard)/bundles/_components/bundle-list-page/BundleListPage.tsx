"use client";

import { apiFetchBrowser } from "@balanse/api-client/browser";
import {
  type AdminBundle,
  type BundleCreditMetrics,
  bundleStatusLabel,
  EMPTY_BUNDLE_CREDIT_METRICS,
  formatPeso,
  type HttpBundleAcquisition,
} from "@balanse/domain";
import { Badge, Button, FeedbackState, TablePageSkeleton } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import {
  useApproveBundleAcquisition,
  useRejectBundleAcquisition,
  useSetAdminBundleStatus,
} from "@/lib/query/mutations";
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
  const approve = useApproveBundleAcquisition();
  const reject = useRejectBundleAcquisition();

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

      <section className="mt-10 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="border-b border-border/70 bg-muted/25 px-5 py-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Review queue
          </p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl">Paid package reviews</h2>
            <span className="rounded-sm bg-muted px-2.5 py-1 text-xs font-medium tabular-nums">
              {reviews.length} pending
            </span>
          </div>
        </div>
        {reviews.length === 0 ? (
          <FeedbackState id="admin.no-package-reviews" className="m-5" />
        ) : (
          <ul className="divide-y divide-border/70">
            {reviews.map((row: HttpBundleAcquisition) => (
              <li key={row.id} className="p-5 transition-colors hover:bg-muted/20">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {bundlesQuery.data.find((bundle) => bundle.id === row.bundleId)?.name ??
                        "Package"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {row.profileId} · {formatPeso(row.payment?.amountPhp ?? 0)} · manual review
                    </p>
                  </div>
                  <AdminCan action="bundles-manage">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          void approve
                            .mutateAsync(row.id)
                            .then(() => notify.admin("bundle.acquisition-reviewed"))
                            .catch(() => notify.admin("bundle.review-failed"));
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          void reject
                            .mutateAsync({ id: row.id, reason: "Manual review rejected" })
                            .then(() => notify.admin("bundle.acquisition-reviewed"))
                            .catch(() => notify.admin("bundle.review-failed"));
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </AdminCan>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPageShell>
  );
}
