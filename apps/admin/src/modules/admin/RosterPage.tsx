"use client";

import {
  attendanceUtilisation,
  type CustomerBooking,
  formatRatioPercent,
  formatSessionDate,
  formatSessionTime,
  NO_REFUND_ON_NOSHOW_NOTE,
  occupancyRatio,
  paymentStatusLabel,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { StatusBadge } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { adminCustomersQuery, adminSessionRosterQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { ConfirmAction } from "./shared";

export function RosterPage({ sessionId }: { sessionId: string }) {
  const { principal } = useMockPrincipal();
  const rosterQuery = useQuery(adminSessionRosterQuery(principal.role, sessionId));
  const customersQuery = useQuery(adminCustomersQuery(principal.role));
  const roster = rosterQuery.data ?? null;
  const customers = customersQuery.data ?? [];

  if (!roster) return null;

  const name = (id: string) => customers.find((row) => row.id === id)?.fullName ?? id;
  const occ = occupancyRatio(roster.confirmedCount, roster.capacity);
  const att = attendanceUtilisation(roster.checkedIn, roster.capacity);

  async function refresh() {
    await rosterQuery.refetch();
  }

  const title = `${roster.session.className} — ${formatSessionDate(roster.session.startsAt)} — ${formatSessionTime(roster.session.startsAt)}`;

  return (
    <AdminPageShell
      className="max-w-3xl overflow-x-hidden"
      title={title}
      breadcrumb={[{ label: "Schedule", href: "/schedule" }, { label: "Roster" }]}
    >
      <p>{roster.session.coachName}</p>
      <p className="text-sm text-muted-foreground">
        {roster.confirmedCount} confirmed · {roster.heldCount} held · {roster.waitlistedCount}{" "}
        waitlisted
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Metric label="Capacity" value={roster.capacity} />
        <Metric label="Confirmed" value={roster.confirmedCount} />
        <Metric label="Held" value={roster.heldCount} />
        <Metric label="Available" value={roster.available} />
        <Metric label="Waitlisted" value={roster.waitlistedCount} />
        <Metric label="Checked In" value={roster.checkedIn} />
        <Metric label="No-show" value={roster.noShow} />
        <Metric label="Occupancy" value={formatRatioPercent(occ)} />
        <Metric label="Attendance Utilization" value={formatRatioPercent(att)} />
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">
        Confirmed + Held + Available = {roster.confirmedCount + roster.heldCount + roster.available}{" "}
        / {roster.capacity}
      </p>

      <RosterGroup title="Confirmed" rows={roster.confirmed} name={name} onChange={refresh} />
      <RosterGroup title="Held / Pending" rows={roster.held} name={name} onChange={refresh} />
      <section className="mt-8">
        <h2 className="font-display text-2xl">Waitlist (FIFO)</h2>
        <ol className="mt-3 space-y-2">
          {roster.waitlisted.map((row, index) => (
            <li key={row.id} className="rounded-xl border border-border p-3">
              <p className="font-medium">
                {index + 1}. {name(row.customerId)}
              </p>
              <Link className="text-sm underline" href={`/bookings/${row.id}`}>
                Inspect booking
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </AdminPageShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-medium">{value}</dd>
    </div>
  );
}

function RosterGroup({
  title,
  rows,
  name,
  onChange,
}: {
  title: string;
  rows: CustomerBooking[];
  name: (id: string) => string;
  onChange: () => Promise<void>;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl">{title}</h2>
      <ul className="mt-3 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-border p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{name(row.customerId)}</p>
                <p className="text-sm">Payment: {paymentStatusLabel(row.paymentStatus)}</p>
                <p className="text-sm">
                  Attendance: <StatusBadge status={row.status} surface="admin" />
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ConfirmAction
                  triggerLabel="Check In"
                  title="Check this guest in?"
                  description="Attendance updates immediately in this mock."
                  onConfirm={() => getMockAdapter().checkIn(row.id).then(onChange)}
                />
                <ConfirmAction
                  triggerLabel="Mark no-show"
                  title="Mark as no-show?"
                  description={NO_REFUND_ON_NOSHOW_NOTE}
                  variant="outline"
                  onConfirm={() => getMockAdapter().markNoShow(row.id).then(onChange)}
                />
                <Link
                  className="inline-flex min-h-11 items-center underline"
                  href={`/bookings/${row.id}`}
                >
                  Inspect booking/payment
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
