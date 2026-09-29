"use client";

import {
  type ClassPerformanceRow,
  formatPeso,
  formatSessionDate,
  formatSessionTime,
  type SessionPerformanceRow,
  sessionDisplayName,
} from "@balanse/domain";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { ReportsOverview } from "@/components/balanse/reports-overview/ReportsOverview";
import { adminReportsQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { DEFAULT_SALES_FILTERS } from "../../_lib/sales-filters";
import type { SalesPageProps } from "./SalesPage.meta";

const classColumns: ColumnDef<ClassPerformanceRow, unknown>[] = [
  { accessorKey: "className", header: "Class", meta: { mobile: { role: "title" } } },
  { accessorKey: "sessions", header: "Sessions", meta: { mobile: { role: "meta" } } },
  {
    accessorKey: "revenuePhp",
    header: "Gross sales",
    cell: ({ row }) => formatPeso(row.original.revenuePhp),
    meta: { mobile: { role: "meta" } },
  },
];

const sessionColumns: ColumnDef<SessionPerformanceRow, unknown>[] = [
  {
    id: "session",
    header: "Session",
    accessorFn: sessionDisplayName,
    cell: ({ row }) => (
      <Link className="underline underline-offset-4" href={`/reports/${row.original.sessionId}`}>
        {sessionDisplayName(row.original)}
      </Link>
    ),
    meta: { mobile: { role: "title" } },
  },
  {
    accessorKey: "startsAt",
    header: "Date / time",
    cell: ({ row }) =>
      `${formatSessionDate(row.original.startsAt)} · ${formatSessionTime(row.original.startsAt)}`,
    meta: { mobile: { role: "subtitle" } },
  },
  {
    accessorKey: "className",
    header: "Class",
    meta: { enableFaceting: true, facetLabel: "Class", mobile: { role: "meta" } },
  },
  {
    accessorKey: "revenuePhp",
    header: "Gross sales",
    cell: ({ row }) => formatPeso(row.original.revenuePhp),
    meta: { mobile: { role: "meta" } },
  },
];

export function SalesPage({ initialRange = DEFAULT_SALES_FILTERS }: SalesPageProps) {
  const { principal } = useMockPrincipal();
  const [range, setRange] = useState(initialRange);
  const { data: reports } = useSuspenseQuery(adminReportsQuery(principal, range));

  return (
    <AdminPageShell
      title="Sales"
      eyebrow="Studio"
      description="Track studio sales, refunds, and revenue by class."
      breadcrumb={[{ label: "Sales" }]}
    >
      <ReportsOverview
        hideTitle
        reports={reports}
        from={range.from}
        to={range.to}
        onRangeChange={setRange}
      />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-4">
        <p className="text-sm">
          <strong className="tabular-nums">{reports.overview.paidBookings}</strong> paid bookings in
          this range
        </p>
        <p className="max-w-xl text-xs leading-5 text-muted-foreground">
          Based on session dates. Unpaid reservations and waitlisted bookings are excluded from
          sales. Refunds are deducted from gross sales to calculate net sales.
        </p>
      </div>
      <div className="mt-8 grid gap-8">
        <AdminDataTable
          tableId="sales-classes"
          title="Sales by class"
          description="Gross sales before refunds, grouped by class."
          data={reports.classPerformance}
          columns={classColumns}
          getRowId={(row) => row.classId}
          searchPlaceholder="Search classes"
          empty={
            <p className="p-6 text-sm text-muted-foreground">
              No class sales for this date range. Try another range.
            </p>
          }
        />
        <AdminDataTable
          tableId="sales-sessions"
          title="Session sales"
          description="Open a session to review its sales and refunds."
          data={reports.sessionPerformance}
          columns={sessionColumns}
          getRowId={(row) => row.sessionId}
          searchPlaceholder="Search sessions"
          empty={
            <p className="p-6 text-sm text-muted-foreground">
              No sessions for this date range. Try another range.
            </p>
          }
        />
      </div>
    </AdminPageShell>
  );
}
