"use client";

import { formatPeso, formatSessionDate, formatSessionTime } from "@balanse/domain";
import { Badge, Button } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { AdminPageTabs } from "@/components/balanse/page/admin-page-tabs/AdminPageTabs";
import {
  adminBookingsQuery,
  adminBundleAcquisitionsQuery,
  adminCustomersQuery,
} from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import {
  type TransactionRecord,
  transactionRecords,
  transactionTotals,
} from "../../_lib/transaction-records";
import type { TransactionsPageProps } from "./TransactionsPage.meta";

const tabs = [
  { id: "all", label: "All transactions" },
  { id: "payments", label: "Payments" },
  { id: "refunds", label: "Refunds" },
  { id: "pending", label: "Pending" },
];

const columns: ColumnDef<TransactionRecord, unknown>[] = [
  {
    accessorKey: "customer",
    header: "Customer",
    meta: { mobile: { role: "title" } },
    cell: ({ row }) => (
      <Link className="underline underline-offset-4" href={row.original.href}>
        {row.original.customer}
      </Link>
    ),
  },
  { accessorKey: "description", header: "For", meta: { mobile: { role: "subtitle" } } },
  {
    accessorKey: "type",
    header: "Type",
    enableColumnFilter: true,
    meta: { enableFaceting: true, facetLabel: "Type", mobile: { role: "meta" } },
  },
  {
    accessorKey: "sourceCreatedAt",
    header: "Source created",
    cell: ({ row }) => (
      <span className="grid gap-1 whitespace-nowrap">
        <span>{formatSessionDate(row.original.sourceCreatedAt)}</span>
        <span className="text-xs text-muted-foreground">
          {formatSessionTime(row.original.sourceCreatedAt)}
        </span>
      </span>
    ),
    meta: { mobile: { role: "meta" } },
  },
  {
    accessorKey: "method",
    header: "Method",
    enableColumnFilter: true,
    meta: { enableFaceting: true, facetLabel: "Method", mobile: { role: "meta" } },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableColumnFilter: true,
    meta: { enableFaceting: true, facetLabel: "Status", mobile: { role: "status" } },
    cell: ({ row }) => (
      <span className="grid justify-items-start gap-1">
        <Badge
          variant={
            row.original.status === "Completed"
              ? "success"
              : row.original.status === "Pending"
                ? "warning"
                : row.original.status === "Rejected"
                  ? "danger"
                  : "neutral"
          }
        >
          {row.original.status}
        </Badge>
        <span className="text-xs text-muted-foreground">{row.original.detail}</span>
      </span>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    accessorFn: (row) => (row.type === "Refund" ? -row.amountPhp : row.amountPhp),
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-medium tabular-nums">
        {formatPeso(Number(getValue()))}
      </span>
    ),
    meta: { mobile: { role: "meta" } },
  },
  { accessorKey: "reference", header: "Reference", meta: { mobile: { role: "meta" } } },
];

export function TransactionsPage({ empty = false }: TransactionsPageProps) {
  const { principal } = useMockPrincipal();
  const [tab, setTab] = useState("all");
  const { data: bookings } = useSuspenseQuery(adminBookingsQuery(principal));
  const { data: acquisitions } = useSuspenseQuery(adminBundleAcquisitionsQuery(principal));
  const { data: customers } = useSuspenseQuery(adminCustomersQuery(principal));
  const records = useMemo(
    () => (empty ? [] : transactionRecords(bookings, acquisitions, customers)),
    [bookings, acquisitions, customers, empty],
  );
  const totals = transactionTotals(records);
  const filtered = records.filter((row) =>
    tab === "payments"
      ? row.type !== "Refund"
      : tab === "refunds"
        ? row.type === "Refund"
        : tab === "pending"
          ? row.status === "Pending"
          : true,
  );
  const stats = [
    { label: "Total received", value: formatPeso(totals.received) },
    { label: "Refunded", value: formatPeso(totals.refunded) },
    { label: "Net received", value: formatPeso(totals.net) },
    { label: "Pending records", value: String(totals.pending) },
  ];

  return (
    <AdminPageShell
      title="Transactions"
      eyebrow="Studio"
      description="Booking payments, package purchases, and refunds in one place."
      breadcrumb={[{ label: "Transactions" }]}
      actions={
        <Button variant="outline" nativeButton={false} render={<Link href="/payments" />}>
          Review payments
        </Button>
      }
      stats={
        <div>
          <dl className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="mt-2 text-2xl font-semibold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            All records · Only completed payments and refunds affect totals.
          </p>
        </div>
      }
    >
      <AdminPageTabs tabs={tabs} value={tab} onValueChange={setTab} label="Transaction types">
        <AdminDataTable
          tableId="transactions"
          title={tabs.find((item) => item.id === tab)?.label}
          data={filtered}
          columns={columns}
          getRowId={(row) => row.id}
          searchPlaceholder="Search customers, items, or references"
          empty={
            <p className="p-6 text-sm text-muted-foreground">
              No transactions in this view. Choose another tab or clear your filters.
            </p>
          }
          footnote="Dates show when the source booking or purchase was created, not when money moved. Package credit redemptions and free grants are excluded."
        />
      </AdminPageTabs>
    </AdminPageShell>
  );
}
