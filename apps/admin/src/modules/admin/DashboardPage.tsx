"use client";

import {
  type AdminDashboardSnapshot,
  formatPeso,
  formatRatioPercent,
  formatSessionTime,
} from "@balanse/domain";
import { FeedbackState, LocalizedSkeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, CreditCard, Repeat, Ticket, UserX } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { AdminDataTable, AdminStatusBadge } from "@/components/balanse/AdminDataTable";
import { AdminStatStrip } from "@/components/balanse/AdminStatStrip";
import { adminDashboardQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { PageHeader } from "./shared";

type ScheduleRow = AdminDashboardSnapshot["todaysSchedule"][number];

export function DashboardPage({
  initial,
  loading: forcedLoading,
}: {
  initial?: AdminDashboardSnapshot;
  loading?: boolean;
}) {
  const { principal } = useMockPrincipal();
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const label =
            status === "PUBLISHED" ? "Published" : status === "DRAFT" ? "Draft" : "Cancelled";
          const tone =
            status === "PUBLISHED" ? "primary" : status === "DRAFT" ? "secondary" : "destructive";
          return <AdminStatusBadge label={label} tone={tone} />;
        },
      },
    ],
    [],
  );

  if (forcedLoading || loading) {
    return <LocalizedSkeleton lines={8} label="Loading dashboard" />;
  }

  if (query.isError || !data) {
    return (
      <FeedbackState
        id="calendar.load-failed"
        className="mt-6"
        title="Dashboard could not load"
        description="The operations snapshot did not load. Retry the request."
        actionLabel="Retry"
        onAction={() => {
          void query.refetch();
        }}
      />
    );
  }

  const stats = [
    {
      id: "classes",
      label: "Today's Classes",
      value: String(data.todaysClasses),
      href: "/schedule",
      icon: CalendarDays,
      trend: "stable" as const,
    },
    {
      id: "payments",
      label: "Pending Payments",
      value: String(data.pendingPayments),
      href: "/payments",
      icon: CreditCard,
      trend: data.pendingPayments > 0 ? ("up" as const) : ("stable" as const),
      delta: data.pendingPayments > 0 ? "Needs review" : "Clear",
    },
    {
      id: "cancellations",
      label: "Cancellations",
      value: String(data.cancellations),
      href: "/cancellations",
      icon: UserX,
      trend: data.cancellations > 0 ? ("up" as const) : ("stable" as const),
    },
    {
      id: "reschedules",
      label: "Reschedules",
      value: String(data.reschedules),
      href: "/reschedules",
      icon: Repeat,
      trend: data.reschedules > 0 ? ("up" as const) : ("stable" as const),
    },
    {
      id: "waitlisted",
      label: "Waitlisted",
      value: String(data.waitlisted),
      href: "/bookings?tab=waitlisted",
      icon: Ticket,
      trend: "stable" as const,
    },
  ];

  const attention = [
    {
      id: "payments",
      href: "/payments",
      title: "Payment proof → Review",
      detail:
        data.attention.payments === 0
          ? "No pending payments"
          : `${data.attention.payments} payment${data.attention.payments === 1 ? "" : "s"} waiting`,
    },
    {
      id: "cancellations",
      href: "/cancellations",
      title: "Cancellation → Review",
      detail:
        data.attention.cancellations === 0
          ? "No cancellation requests"
          : `${data.attention.cancellations} request${data.attention.cancellations === 1 ? "" : "s"} waiting`,
    },
    {
      id: "reschedules",
      href: "/reschedules",
      title: "Reschedule → Review",
      detail:
        data.attention.reschedules === 0
          ? "No reschedule requests"
          : `${data.attention.reschedules} request${data.attention.reschedules === 1 ? "" : "s"} waiting`,
    },
  ];

  return (
    <section>
      <PageHeader title="Dashboard" />
      <div className="mt-6">
        <AdminStatStrip stats={stats} />
      </div>

      <h2 className="mt-10 font-display text-2xl">Needs Attention</h2>
      <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {attention.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex flex-col gap-1 px-4 py-3 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="text-sm font-medium">{item.title}</span>
              <span className="text-sm text-muted-foreground">{item.detail}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        {data.todaysSchedule.length === 0 ? (
          <>
            <h2 className="font-display text-2xl">Today&apos;s Schedule</h2>
            <FeedbackState id="admin.no-sessions" className="mt-3" />
          </>
        ) : (
          <AdminDataTable
            title="Today's Schedule"
            description="Published and draft sessions for today."
            data={data.todaysSchedule}
            columns={columns}
            getRowId={(row) => row.id}
            searchable
            searchPlaceholder="Search class or coach"
            emptyLabel="No sessions on today's board."
          />
        )}
      </div>

      <section className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Today&apos;s Sales</p>
          <p className="mt-2 font-display text-2xl">{formatPeso(data.todaysSalesPhp)}</p>
        </article>
        <article className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Pending Refunds</p>
          <p className="mt-2 font-display text-2xl">{formatPeso(data.pendingRefundsPhp)}</p>
        </article>
        <article className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Today&apos;s Occupancy</p>
          <p className="mt-2 font-display text-2xl">{formatRatioPercent(data.todaysOccupancy)}</p>
        </article>
        {principal.role === "admin" ? (
          <article className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Coach Cost Today</p>
            <p className="mt-2 font-display text-2xl">{formatPeso(data.coachCostTodayPhp)}</p>
          </article>
        ) : null}
      </section>
    </section>
  );
}
