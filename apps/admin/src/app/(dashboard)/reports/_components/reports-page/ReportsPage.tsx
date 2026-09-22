"use client";

import {
  type AdminReports,
  formatPeso,
  formatRatioPercent,
  formatSessionDate,
  formatSessionTime,
  sessionDisplayName,
} from "@balanse/domain";
import type { ChoiceOption } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toCoachChoiceOption } from "@/components/balanse/coach/coach-option/CoachOption";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { ReportsOverview } from "@/components/balanse/reports-overview/ReportsOverview";
import {
  adminClassesQuery,
  adminCoachesQuery,
  adminReportsQuery,
  adminSessionReportQuery,
} from "@/lib/query/queries";
import { useCanAdminAction } from "@/modules/authorization/useAdminAccess";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { ReportsFilterForm } from "./reports-filter-form/ReportsFilterForm";

export function ReportsPage({ empty }: { empty?: boolean }) {
  const { principal } = useMockPrincipal();
  const canSales = useCanAdminAction("reports-sales");
  const canCapacity = useCanAdminAction("reports-capacity");
  const canCoachCosts = useCanAdminAction("reports-coach-costs");
  const canSession = useCanAdminAction("reports-session");
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState("2026-09-30");
  const [classId, setClassId] = useState("all");
  const [coachId, setCoachId] = useState("all");
  const [sessionStatus, setSessionStatus] = useState("all");
  const classesQuery = useSuspenseQuery(adminClassesQuery(principal));
  const coachesQuery = useSuspenseQuery(adminCoachesQuery(principal));
  const reportsQuery = useSuspenseQuery(
    adminReportsQuery(principal, {
      from,
      to,
      classId,
      coachId,
      sessionStatus: sessionStatus === "all" ? "all" : (sessionStatus as "PUBLISHED"),
    }),
  );
  const classes = classesQuery.data ?? [];
  const coaches = coachesQuery.data ?? [];
  const reports = empty
    ? {
        ...reportsQuery.data,
        sessionPerformance: [],
        classPerformance: [],
        coachCosts: [],
      }
    : reportsQuery.data;

  const classColumns = useMemo<ColumnDef<AdminReports["classPerformance"][number], unknown>[]>(
    () => [
      { accessorKey: "className", header: "Class", meta: { mobile: { role: "title" } } },
      { accessorKey: "sessions", header: "Sessions", meta: { mobile: { role: "meta" } } },
      {
        accessorKey: "revenuePhp",
        header: "Revenue",
        meta: { mobile: { role: "meta" } },
        cell: ({ row }) => formatPeso(row.original.revenuePhp),
      },
      {
        accessorKey: "occupancy",
        header: "Occupancy",
        meta: { mobile: { role: "meta" } },
        cell: ({ row }) => formatRatioPercent(row.original.occupancy),
      },
      { accessorKey: "noShows", header: "No-shows", meta: { mobile: { role: "meta" } } },
    ],
    [],
  );
  const coachColumns = useMemo<ColumnDef<AdminReports["coachCosts"][number], unknown>[]>(
    () => [
      { accessorKey: "coachName", header: "Coach", meta: { mobile: { role: "title" } } },
      { accessorKey: "sessions", header: "Sessions", meta: { mobile: { role: "meta" } } },
      {
        accessorKey: "coachCostPhp",
        header: "Coach Cost",
        meta: { mobile: { role: "meta" } },
        cell: ({ row }) => formatPeso(row.original.coachCostPhp),
      },
      {
        accessorKey: "relatedRevenuePhp",
        header: "Related Revenue",
        meta: { mobile: { role: "meta" } },
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
        meta: { mobile: { role: "title" } },
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
        meta: { enableFaceting: true, facetLabel: "Class", mobile: { role: "subtitle" } },
      },
      { accessorKey: "capacity", header: "Capacity", meta: { mobile: { role: "meta" } } },
      { accessorKey: "confirmed", header: "Confirmed", meta: { mobile: { role: "meta" } } },
      {
        accessorKey: "revenuePhp",
        header: "Revenue",
        meta: { mobile: { role: "meta" } },
        cell: ({ row }) => formatPeso(row.original.revenuePhp),
      },
      {
        accessorKey: "coachCostPhp",
        header: "Cost",
        meta: { mobile: { role: "meta" } },
        cell: ({ row }) => formatPeso(row.original.coachCostPhp),
      },
    ],
    [],
  );

  const noData = reports.sessionPerformance.length === 0;
  const coachFilterOptions = useMemo<ChoiceOption[]>(
    () => [{ value: "all", label: "All coaches" }, ...coaches.map(toCoachChoiceOption)],
    [coaches],
  );
  const selectedCoachFilter =
    coachFilterOptions.find((option) => option.value === coachId) ?? coachFilterOptions[0];

  return (
    <AdminPageShell title="Reports">
      {canSales ? (
        <ReportsOverview
          hideTitle
          reports={reports}
          from={from}
          to={to}
          onRangeChange={(next) => {
            setFrom(next.from);
            setTo(next.to);
          }}
        />
      ) : null}
      <ReportsFilterForm
        classes={classes}
        coachFilterOptions={coachFilterOptions}
        selectedCoachFilter={selectedCoachFilter}
        classId={classId}
        coachId={coachId}
        sessionStatus={sessionStatus}
        onClassChange={setClassId}
        onCoachChange={setCoachId}
        onStatusChange={setSessionStatus}
      />

      {noData ? (
        <p className="mt-8 text-sm text-muted-foreground">No data for the selected range.</p>
      ) : (
        <div className="mt-10 grid gap-10">
          {canSales || canCapacity ? (
            <AdminDataTable
              tableId="reports-classes"
              title="Class Performance"
              data={reports.classPerformance}
              columns={
                canSales
                  ? classColumns
                  : classColumns.filter(
                      (column) => !("accessorKey" in column && column.accessorKey === "revenuePhp"),
                    )
              }
              getRowId={(row) => row.classId}
              searchPlaceholder="Search classes"
            />
          ) : null}
          {canCoachCosts ? (
            <>
              <p className="text-sm text-muted-foreground">
                Coach costs use each coach’s saved rate. Related revenue includes the full class
                session for each coach and should not be added across coaches.
              </p>
              <AdminDataTable
                tableId="reports-coaches"
                title="Coach Costs"
                data={reports.coachCosts}
                columns={coachColumns}
                getRowId={(row) => row.coachId}
                searchPlaceholder="Search coaches"
              />
            </>
          ) : null}
          {canSession ? (
            <AdminDataTable
              tableId="reports-sessions"
              title="Session Performance"
              data={reports.sessionPerformance}
              columns={
                canCoachCosts
                  ? sessionColumns
                  : sessionColumns.filter(
                      (column) =>
                        !("accessorKey" in column && column.accessorKey === "coachCostPhp"),
                    )
              }
              getRowId={(row) => row.sessionId}
              searchPlaceholder="Search sessions"
            />
          ) : null}
        </div>
      )}
    </AdminPageShell>
  );
}

export function ReportDrilldownPage({ sessionId }: { sessionId: string }) {
  const { principal } = useMockPrincipal();
  const query = useSuspenseQuery(adminSessionReportQuery(principal, sessionId));
  const row = query.data;
  if (!row) return null;

  const title = `${sessionDisplayName(row)} — ${formatSessionDate(row.startsAt)} — ${formatSessionTime(row.startsAt)}`;

  return (
    <AdminPageShell
      className="max-w-xl"
      title={title}
      breadcrumb={[{ label: "Reports", href: "/reports" }, { label: title }]}
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
