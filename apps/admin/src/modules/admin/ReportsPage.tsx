"use client";

import {
  type AdminReports,
  formatPeso,
  formatRatioPercent,
  formatSessionDate,
  formatSessionTime,
} from "@balanse/domain";
import { DetailPageSkeleton, Label, NativeSelect, TablePageSkeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/AdminDataTable";
import { ReportsOverview } from "@/components/balanse/ReportsOverview";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import {
  adminClassesQuery,
  adminCoachesQuery,
  adminReportsQuery,
  adminSessionReportQuery,
} from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function ReportsPage({ empty }: { empty?: boolean }) {
  const { principal } = useMockPrincipal();
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState("2026-09-30");
  const [classId, setClassId] = useState("all");
  const [coachId, setCoachId] = useState("all");
  const [sessionStatus, setSessionStatus] = useState("all");
  const classesQuery = useQuery(adminClassesQuery(principal.role));
  const coachesQuery = useQuery(adminCoachesQuery(principal.role));
  const reportsQuery = useQuery(
    adminReportsQuery(principal.role, {
      from,
      to,
      classId,
      coachId,
      sessionStatus: sessionStatus === "all" ? "all" : (sessionStatus as "PUBLISHED"),
    }),
  );
  const classes = classesQuery.data ?? [];
  const coaches = coachesQuery.data ?? [];
  const reports = !reportsQuery.data
    ? null
    : empty
      ? {
          ...reportsQuery.data,
          sessionPerformance: [],
          classPerformance: [],
          coachCosts: [],
        }
      : reportsQuery.data;

  const classColumns = useMemo<ColumnDef<AdminReports["classPerformance"][number], unknown>[]>(
    () => [
      { accessorKey: "className", header: "Class" },
      { accessorKey: "sessions", header: "Sessions" },
      {
        accessorKey: "revenuePhp",
        header: "Revenue",
        cell: ({ row }) => formatPeso(row.original.revenuePhp),
      },
      {
        accessorKey: "occupancy",
        header: "Occupancy",
        cell: ({ row }) => formatRatioPercent(row.original.occupancy),
      },
      { accessorKey: "noShows", header: "No-shows" },
    ],
    [],
  );
  const coachColumns = useMemo<ColumnDef<AdminReports["coachCosts"][number], unknown>[]>(
    () => [
      { accessorKey: "coachName", header: "Coach" },
      { accessorKey: "sessions", header: "Sessions" },
      {
        accessorKey: "coachCostPhp",
        header: "Coach Cost",
        cell: ({ row }) => formatPeso(row.original.coachCostPhp),
      },
      {
        accessorKey: "relatedRevenuePhp",
        header: "Related Revenue",
        cell: ({ row }) => formatPeso(row.original.relatedRevenuePhp),
      },
    ],
    [],
  );
  const sessionColumns = useMemo<ColumnDef<AdminReports["sessionPerformance"][number], unknown>[]>(
    () => [
      {
        id: "when",
        header: "Date/Time",
        accessorFn: (row) => `${row.startsAt}`,
        cell: ({ row }) => (
          <Link
            className="underline underline-offset-4"
            href={`/reports/${row.original.sessionId}`}
          >
            {formatSessionDate(row.original.startsAt)} {formatSessionTime(row.original.startsAt)}
          </Link>
        ),
      },
      {
        accessorKey: "className",
        header: "Class",
        enableColumnFilter: true,
        meta: { enableFaceting: true, facetLabel: "Class" },
      },
      { accessorKey: "capacity", header: "Capacity" },
      { accessorKey: "confirmed", header: "Confirmed" },
      {
        accessorKey: "revenuePhp",
        header: "Revenue",
        cell: ({ row }) => formatPeso(row.original.revenuePhp),
      },
      {
        accessorKey: "coachCostPhp",
        header: "Cost",
        cell: ({ row }) => formatPeso(row.original.coachCostPhp),
      },
    ],
    [],
  );

  if (!reports) {
    return (
      <AdminPageShell title="Reports">
        <TablePageSkeleton label="Loading reports" rows={8} columns={6} />
      </AdminPageShell>
    );
  }
  const noData = reports.sessionPerformance.length === 0;

  return (
    <section>
      <ReportsOverview
        reports={reports}
        from={from}
        to={to}
        onRangeChange={(next) => {
          setFrom(next.from);
          setTo(next.to);
        }}
      />
      <form className="mt-8 grid gap-3 md:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="report-class">Class</Label>
          <NativeSelect
            id="report-class"
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
          >
            <option value="all">All classes</option>
            {classes.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="report-coach">Coach</Label>
          <NativeSelect
            id="report-coach"
            value={coachId}
            onChange={(event) => setCoachId(event.target.value)}
          >
            <option value="all">All coaches</option>
            {coaches.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="report-status">Session Status</Label>
          <NativeSelect
            id="report-status"
            value={sessionStatus}
            onChange={(event) => setSessionStatus(event.target.value)}
          >
            <option value="all">All</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CANCELLED">Cancelled</option>
          </NativeSelect>
        </div>
      </form>

      {noData ? (
        <p className="mt-8 text-sm text-muted-foreground">No data for the selected range.</p>
      ) : (
        <div className="mt-10 grid gap-10">
          <AdminDataTable
            tableId="reports-classes"
            title="Class Performance"
            data={reports.classPerformance}
            columns={classColumns}
            getRowId={(row) => row.classId}
            searchPlaceholder="Search classes"
          />
          <AdminDataTable
            tableId="reports-coaches"
            title="Coach Costs"
            data={reports.coachCosts}
            columns={coachColumns}
            getRowId={(row) => row.coachId}
            searchPlaceholder="Search coaches"
          />
          <AdminDataTable
            tableId="reports-sessions"
            title="Session Performance"
            data={reports.sessionPerformance}
            columns={sessionColumns}
            getRowId={(row) => row.sessionId}
            searchPlaceholder="Search sessions"
          />
        </div>
      )}
    </section>
  );
}

export function ReportDrilldownPage({ sessionId }: { sessionId: string }) {
  const { principal } = useMockPrincipal();
  const query = useQuery(adminSessionReportQuery(principal.role, sessionId));
  const row = query.data ?? null;

  if (!row) {
    return (
      <AdminPageShell title="Session report">
        <DetailPageSkeleton label="Loading session report" />
      </AdminPageShell>
    );
  }

  const title = `${row.className} — ${formatSessionDate(row.startsAt)} — ${formatSessionTime(row.startsAt)}`;

  return (
    <AdminPageShell
      className="max-w-xl"
      title={title}
      breadcrumb={[
        { label: "Reports", href: "/reports" },
        { label: title },
      ]}
    >
      <dl className="grid gap-2 text-sm">
        <Line label="Capacity" value={row.capacity} />
        <Line label="Confirmed" value={row.confirmed} />
        <Line label="Held" value={row.held} />
        <Line label="Available" value={row.available} />
        <Line label="Waitlisted" value={row.waitlisted} />
        <Line label="Checked In" value={row.checkedIn} />
        <Line label="No-show" value={row.noShow} />
        <Line label="Customer Price" value={formatPeso(row.customerPricePhp)} />
        <Line label="Gross Revenue" value={formatPeso(row.grossRevenuePhp)} />
        <Line label="Refunds" value={formatPeso(row.refundsPhp)} />
        <Line label="Coach Cost" value={formatPeso(row.coachCostPhp)} />
        <Line label="Gross Contribution" value={formatPeso(row.grossContributionPhp)} />
        <Line label="Occupancy" value={formatRatioPercent(row.occupancy)} />
        <Line
          label="Attendance Utilization"
          value={formatRatioPercent(row.attendanceUtilisation)}
        />
      </dl>
      <Link className="mt-6 inline-flex text-sm underline underline-offset-4" href="/reports">
        Back to reports
      </Link>
    </AdminPageShell>
  );
}

function Line({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
