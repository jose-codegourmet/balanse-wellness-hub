"use client";

import {
  type AdminDashboardSnapshot,
  formatPeso,
  formatRatioPercent,
  formatSessionTime,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { FeedbackState, LocalizedSkeleton } from "@balanse/ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { DataTable, PageHeader } from "./shared";

export function DashboardPage({
  initial,
  loading: forcedLoading,
}: {
  initial?: AdminDashboardSnapshot;
  loading?: boolean;
}) {
  const { principal } = useMockPrincipal();
  const [data, setData] = useState<AdminDashboardSnapshot | null>(initial ?? null);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    if (initial) return;
    void getMockAdapter()
      .getAdminDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, [initial]);

  if (forcedLoading || loading || !data) {
    return <LocalizedSkeleton lines={8} label="Loading dashboard" />;
  }

  const tiles = [
    { label: "Today's Classes", value: data.todaysClasses, href: "/schedule" },
    { label: "Pending Payments", value: data.pendingPayments, href: "/payments" },
    { label: "Cancellations", value: data.cancellations, href: "/cancellations" },
    { label: "Reschedules", value: data.reschedules, href: "/reschedules" },
    { label: "Waitlisted", value: data.waitlisted, href: "/bookings?tab=waitlisted" },
  ];

  return (
    <section>
      <PageHeader title="Dashboard" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-sm text-muted-foreground">{tile.label}</p>
            <p className="mt-2 font-display text-3xl">{tile.value}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-display text-2xl">Needs Attention</h2>
      <ul className="mt-3 space-y-2">
        <li>
          <Link className="underline underline-offset-4" href="/payments">
            Payment proof → Review
          </Link>
          {data.attention.payments === 0 ? (
            <span className="ml-2 text-sm text-muted-foreground">No pending payments</span>
          ) : null}
        </li>
        <li>
          <Link className="underline underline-offset-4" href="/cancellations">
            Cancellation → Review
          </Link>
          {data.attention.cancellations === 0 ? (
            <span className="ml-2 text-sm text-muted-foreground">No cancellation requests</span>
          ) : null}
        </li>
        <li>
          <Link className="underline underline-offset-4" href="/reschedules">
            Reschedule → Review
          </Link>
          {data.attention.reschedules === 0 ? (
            <span className="ml-2 text-sm text-muted-foreground">No reschedule requests</span>
          ) : null}
        </li>
      </ul>

      <h2 className="mt-10 font-display text-2xl">Today&apos;s Schedule</h2>
      {data.todaysSchedule.length === 0 ? (
        <FeedbackState id="admin.no-sessions" className="mt-3" />
      ) : (
        <DataTable columns={["Time", "Class", "Coach", "Capacity", "Status"]}>
          {data.todaysSchedule.map((session) => (
            <tr key={session.id} className="border-t border-border">
              <td className="px-3 py-2">{formatSessionTime(session.startsAt)}</td>
              <td className="px-3 py-2">{session.className}</td>
              <td className="px-3 py-2">{session.coachName}</td>
              <td className="px-3 py-2">{session.capacity}</td>
              <td className="px-3 py-2">
                {session.status === "PUBLISHED"
                  ? "Published"
                  : session.status === "DRAFT"
                    ? "Draft"
                    : "Cancelled"}
              </td>
            </tr>
          ))}
        </DataTable>
      )}

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
