"use client";

import {
  type BundleAcquisition,
  type BundleDefinition,
  bundleStatusLabel,
  formatPeso,
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
import { adminBundleAcquisitionsQuery, adminBundlesQuery } from "@/lib/query/queries";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export type BundleListPageProps = {
  empty?: boolean;
  loading?: boolean;
  error?: boolean;
};

function statusVariant(status: BundleDefinition["status"]) {
  if (status === "PUBLISHED") return "success" as const;
  if (status === "ARCHIVED") return "danger" as const;
  return "neutral" as const;
}

export function BundleListPage({ empty, loading, error }: BundleListPageProps) {
  const { principal } = useMockPrincipal();
  const bundlesQuery = useSuspenseQuery(adminBundlesQuery(principal));
  const acquisitionsQuery = useSuspenseQuery(adminBundleAcquisitionsQuery(principal));
  const setStatus = useSetAdminBundleStatus();
  const approve = useApproveBundleAcquisition();
  const reject = useRejectBundleAcquisition();

  const rows = useMemo(() => (empty ? [] : bundlesQuery.data), [bundlesQuery.data, empty]);
  const reviews = useMemo(
    () => (empty ? [] : acquisitionsQuery.data.filter((row) => row.status === "PENDING_REVIEW")),
    [acquisitionsQuery.data, empty],
  );

  const columns = useMemo<ColumnDef<BundleDefinition, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: { primaryLink: (row) => `/bundles/${row.id}`, mobile: { role: "title" } },
      },
      {
        accessorKey: "sessionCredits",
        header: "Sessions",
        meta: { mobile: { role: "subtitle" } },
      },
      {
        id: "price",
        header: "Price",
        accessorFn: (row) => formatPeso(row.pricePhp),
        meta: { mobile: { role: "meta" } },
      },
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
    [],
  );

  return (
    <AdminPageShell
      title="Bundles"
      actions={
        <Button nativeButton={false} render={<Link href="/bundles/new" />}>
          Add package
        </Button>
      }
    >
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Packages grant a fixed number of sessions. Editing changes future acquisitions only.
        Existing entitlements keep their snapshots. Credits are not cash refunds.
      </p>
      {loading ? (
        <TablePageSkeleton label="Loading packages" rows={5} columns={4} />
      ) : error ? (
        <FeedbackState
          id="calendar.load-failed"
          className="mt-6"
          title="Could not load packages"
          description="The mock harness failed this request. Retry after clearing failNext."
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
          rowActions={(row) => [
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
          ]}
        />
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl">Paid package reviews</h2>
        {reviews.length === 0 ? (
          <FeedbackState id="admin.no-package-reviews" className="mt-4" />
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.map((row: BundleAcquisition) => (
              <li key={row.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{row.bundleName}</p>
                    <p className="text-sm text-muted-foreground">
                      {row.customerId} · {formatPeso(row.pricePhp)} · manual review
                    </p>
                  </div>
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPageShell>
  );
}
