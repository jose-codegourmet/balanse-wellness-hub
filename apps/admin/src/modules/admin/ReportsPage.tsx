"use client";

import {
  type AdminClass,
  type AdminCoach,
  type AdminReports,
  formatPeso,
  formatRatioPercent,
  formatSessionDate,
  formatSessionTime,
  type SessionReportDrilldown,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Input, Label, LocalizedSkeleton, NativeSelect } from "@balanse/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable, PageHeader } from "./shared";

export function ReportsPage({ empty }: { empty?: boolean }) {
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState("2026-09-30");
  const [classId, setClassId] = useState("all");
  const [coachId, setCoachId] = useState("all");
  const [sessionStatus, setSessionStatus] = useState("all");
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [coaches, setCoaches] = useState<AdminCoach[]>([]);
  const [reports, setReports] = useState<AdminReports | null>(null);

  useEffect(() => {
    void Promise.all([getMockAdapter().getAdminClasses(), getMockAdapter().getAdminCoaches()]).then(
      ([classRows, coachRows]) => {
        setClasses(classRows);
        setCoaches(coachRows);
      },
    );
  }, []);

  useEffect(() => {
    if (!from || !to) return;
    void getMockAdapter()
      .getAdminReports({
        from,
        to,
        classId,
        coachId,
        sessionStatus: sessionStatus === "all" ? "all" : (sessionStatus as "PUBLISHED"),
      })
      .then((next) =>
        setReports(
          empty ? { ...next, sessionPerformance: [], classPerformance: [], coachCosts: [] } : next,
        ),
      );
  }, [classId, coachId, empty, from, to, sessionStatus]);

  if (!reports) return <LocalizedSkeleton lines={8} label="Loading reports" />;
  const noData = reports.sessionPerformance.length === 0;

  return (
    <section>
      <PageHeader title="Reports" />
      <form className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="grid gap-1.5">
          <Label htmlFor="report-from">Date Range</Label>
          <Input
            id="report-from"
            type="date"
            required
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
          <Input
            id="report-to"
            type="date"
            required
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </div>
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
        <>
          <h2 className="mt-10 font-display text-2xl">Sales Overview</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card label="Gross Sales" value={formatPeso(reports.overview.grossSalesPhp)} />
            <Card label="Refunds" value={formatPeso(reports.overview.refundsPhp)} />
            <Card label="Net Sales" value={formatPeso(reports.overview.netSalesPhp)} />
            <Card label="Paid Bookings" value={String(reports.overview.paidBookings)} />
          </div>

          <h2 className="mt-10 font-display text-2xl">Class Performance</h2>
          <DataTable columns={["Class", "Sessions", "Revenue", "Occupancy", "No-shows"]}>
            {reports.classPerformance.map((row) => (
              <tr key={row.classId} className="border-t border-border">
                <td className="px-3 py-2">{row.className}</td>
                <td className="px-3 py-2">{row.sessions}</td>
                <td className="px-3 py-2">{formatPeso(row.revenuePhp)}</td>
                <td className="px-3 py-2">{formatRatioPercent(row.occupancy)}</td>
                <td className="px-3 py-2">{row.noShows}</td>
              </tr>
            ))}
          </DataTable>

          <h2 className="mt-10 font-display text-2xl">Coach Costs</h2>
          <DataTable columns={["Coach", "Sessions", "Coach Cost", "Related Revenue"]}>
            {reports.coachCosts.map((row) => (
              <tr key={row.coachId} className="border-t border-border">
                <td className="px-3 py-2">{row.coachName}</td>
                <td className="px-3 py-2">{row.sessions}</td>
                <td className="px-3 py-2">{formatPeso(row.coachCostPhp)}</td>
                <td className="px-3 py-2">{formatPeso(row.relatedRevenuePhp)}</td>
              </tr>
            ))}
          </DataTable>

          <h2 className="mt-10 font-display text-2xl">Session Performance</h2>
          <DataTable columns={["Date/Time", "Class", "Capacity", "Confirmed", "Revenue", "Cost"]}>
            {reports.sessionPerformance.map((row) => (
              <tr key={row.sessionId} className="border-t border-border">
                <td className="px-3 py-2">
                  <Link className="underline underline-offset-4" href={`/reports/${row.sessionId}`}>
                    {formatSessionDate(row.startsAt)} {formatSessionTime(row.startsAt)}
                  </Link>
                </td>
                <td className="px-3 py-2">{row.className}</td>
                <td className="px-3 py-2">{row.capacity}</td>
                <td className="px-3 py-2">{row.confirmed}</td>
                <td className="px-3 py-2">{formatPeso(row.revenuePhp)}</td>
                <td className="px-3 py-2">{formatPeso(row.coachCostPhp)}</td>
              </tr>
            ))}
          </DataTable>
        </>
      )}
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </article>
  );
}

export function ReportDrilldownPage({ sessionId }: { sessionId: string }) {
  const [row, setRow] = useState<SessionReportDrilldown | null>(null);

  useEffect(() => {
    void getMockAdapter().getAdminSessionReport(sessionId).then(setRow);
  }, [sessionId]);

  if (!row) return <LocalizedSkeleton lines={8} label="Loading session report" />;

  return (
    <section className="max-w-xl">
      <PageHeader
        title={`${row.className} — ${formatSessionDate(row.startsAt)} — ${formatSessionTime(row.startsAt)}`}
      />
      <dl className="mt-6 grid gap-2 text-sm">
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
    </section>
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
