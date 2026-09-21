"use client";

import {
  type AdminDashboardSnapshot,
  formatPeso,
  formatRatioPercent,
  formatSessionTime,
} from "@balanse/domain";
import { Badge, BentoSkeleton, Button, FeedbackState } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, CreditCard, Repeat, Ticket, UserX } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { AdminStatStrip } from "@/components/balanse/admin-stat-strip/AdminStatStrip";
import { DashboardBento } from "@/components/balanse/dashboard/dashboard-bento/DashboardBento";
import { dashboardSkeletonTilesForRole } from "@/components/balanse/dashboard/dashboard-bento/DashboardBento.defaults";
import { DashboardTile } from "@/components/balanse/dashboard/dashboard-tile/DashboardTile";
import { NeedsAttentionTile } from "@/components/balanse/dashboard/needs-attention-tile/NeedsAttentionTile";
import { SalesSeriesChart } from "@/components/balanse/dashboard/sales-series-chart/SalesSeriesChart";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminDashboardQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

type ScheduleRow = AdminDashboardSnapshot["todaysSchedule"][number];

export function DashboardPage({
  initial,
  loading: forcedLoading,
}: {
  initial?: AdminDashboardSnapshot;
  loading?: boolean;
}) {
  const { principal } = useMockPrincipal();
  const canViewCoachCost = principal.role === "admin";
  const query = useQuery({
    ...adminDashboardQuery(principal.role),
    ...(initial ? { initialData: initial } : {}),
  });
  const data = query.data ?? null;
  const loading = query.isPending;

  const columns = useMemo<ColumnDef<ScheduleRow, unknown>[]>(
    () => [
      {
        accessorFn: (row) => formatSessionTime(row.startsAt),
        id: "time",
        header: "Time",
        cell: ({ row }) => formatSessionTime(row.original.startsAt),
      },
      { accessorKey: "className", header: "Class" },
      { accessorKey: "coachName", header: "Coach" },
      { accessorKey: "capacity", header: "Capacity" },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) =>
          row.status === "PUBLISHED" ? "Published" : row.status === "DRAFT" ? "Draft" : "Cancelled",
        cell: ({ row }) => {
          const status = row.original.status;
          const label =
            status === "PUBLISHED" ? "Published" : status === "DRAFT" ? "Draft" : "Cancelled";
          const variant =
            status === "PUBLISHED" ? "success" : status === "DRAFT" ? "neutral" : "danger";
          return (
            <Badge variant={variant} appearance="solid" size="sm">
              {label}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  if (forcedLoading) {
    return (
      <AdminPageShell title="Dashboard">
        <BentoSkeleton
          label="Loading dashboard"
          tiles={dashboardSkeletonTilesForRole(canViewCoachCost)}
        />
      </AdminPageShell>
    );
  }

  if (loading && !data) return null;

  if (query.isError || !data) {
    return (
      <AdminPageShell title="Dashboard">
        <FeedbackState
          id="calendar.load-failed"
          title="Dashboard could not load"
          description="The operations snapshot did not load. Retry the request."
          actionLabel="Retry"
          onAction={() => {
            void query.refetch();
          }}
        />
      </AdminPageShell>
    );
  }

  const stats = [
    {
      id: "classes",
      label: "Today's Classes",
      value: String(data.todaysClasses),
      href: "/schedule",
      icon: CalendarDays,
    },
    {
      id: "payments",
      label: "Pending Payments",
      value: String(data.pendingPayments),
      href: "/payments",
      icon: CreditCard,
    },
    {
      id: "cancellations",
      label: "Cancellations",
      value: String(data.cancellations),
      href: "/cancellations",
      icon: UserX,
    },
    {
      id: "reschedules",
      label: "Reschedules",
      value: String(data.reschedules),
      href: "/reschedules",
      icon: Repeat,
    },
    {
      id: "waitlisted",
      label: "Waitlisted",
      value: String(data.waitlisted),
      href: "/bookings?tab=waitlisted",
      icon: Ticket,
    },
  ];

  const attention = [
    {
      id: "payments",
      href: "/payments",
      title: "Payment proof → Review",
      count: data.attention.payments,
      waitingLabel: `${data.attention.payments} payment${data.attention.payments === 1 ? "" : "s"} waiting`,
      clearLabel: "No pending payments",
    },
    {
      id: "cancellations",
      href: "/cancellations",
      title: "Cancellation → Review",
      count: data.attention.cancellations,
      waitingLabel: `${data.attention.cancellations} request${data.attention.cancellations === 1 ? "" : "s"} waiting`,
      clearLabel: "No cancellation requests",
    },
    {
      id: "reschedules",
      href: "/reschedules",
      title: "Reschedule → Review",
      count: data.attention.reschedules,
      waitingLabel: `${data.attention.reschedules} request${data.attention.reschedules === 1 ? "" : "s"} waiting`,
      clearLabel: "No reschedule requests",
    },
  ];

  const scheduleLink = (
    <Button nativeButton={false} variant="outline" size="sm" render={<Link href="/schedule" />}>
      Open schedule
    </Button>
  );

  return (
    <AdminPageShell title="Dashboard" description="Operations first. Analytics stay secondary.">
      <DashboardBento>
        <DashboardTile span="metric">
          <p className="text-sm text-muted-foreground">Today&apos;s Sales</p>
          <p className="mt-2 font-display text-2xl tabular-nums">
            {formatPeso(data.todaysSalesPhp)}
          </p>
        </DashboardTile>
        <DashboardTile span="metric">
          <p className="text-sm text-muted-foreground">Pending Refunds</p>
          <p className="mt-2 font-display text-2xl tabular-nums">
            {formatPeso(data.pendingRefundsPhp)}
          </p>
        </DashboardTile>
        <DashboardTile span="metric">
          <p className="text-sm text-muted-foreground">Today&apos;s Occupancy</p>
          <p className="mt-2 font-display text-2xl tabular-nums">
            {formatRatioPercent(data.todaysOccupancy)}
          </p>
        </DashboardTile>
        {canViewCoachCost ? (
          <DashboardTile span="metric">
            <p className="text-sm text-muted-foreground">Coach Cost Today</p>
            <p className="mt-2 font-display text-2xl tabular-nums">
              {formatPeso(data.coachCostTodayPhp)}
            </p>
          </DashboardTile>
        ) : null}

        <NeedsAttentionTile items={attention} />

        <DashboardTile span="schedule" className="p-4 md:p-5">
          {data.todaysSchedule.length === 0 ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-display text-2xl">Today&apos;s Schedule</h2>
                {scheduleLink}
              </div>
              <FeedbackState id="admin.no-sessions" className="mt-3" />
            </>
          ) : (
            <AdminDataTable
              tableId="dashboard-sessions"
              title="Today's Schedule"
              description="Published and draft sessions for today."
              data={data.todaysSchedule}
              columns={columns}
              getRowId={(row) => row.id}
              searchable={false}
              persistUrl={false}
              toolbar={scheduleLink}
              emptyFilterLabel="No sessions on today's board."
            />
          )}
        </DashboardTile>

        <AdminStatStrip stats={stats} />

        {data.series?.gross_sales ? <SalesSeriesChart series={data.series.gross_sales} /> : null}
      </DashboardBento>
    </AdminPageShell>
  );
}
