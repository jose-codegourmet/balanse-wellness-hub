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
  sessionDisplayName,
} from "@balanse/domain";
import { isMockAuthorizationError } from "@balanse/mock";
import { FeedbackState, StatusBadge } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useCheckIn, useMarkNoShow } from "@/lib/query/mutations";
import { adminSessionRosterQuery } from "@/lib/query/queries";
import { AdminCan, useCanAdminRoute } from "@/modules/authorization/useAdminAccess";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function RosterPage({ sessionId }: { sessionId: string }) {
  const { principal } = useMockPrincipal();
  const canReadPayments = useCanAdminRoute("/payments");
  const rosterQuery = useQuery(adminSessionRosterQuery(principal, sessionId));
  const checkIn = useCheckIn();
  const markNoShow = useMarkNoShow();

  if (rosterQuery.isPending && !rosterQuery.data) {
    return (
      <AdminPageShell title="Roster" breadcrumb={[{ label: "Schedule", href: "/schedule" }]}>
        <p className="text-sm text-muted-foreground">Loading roster…</p>
      </AdminPageShell>
    );
  }

  if (rosterQuery.isError || !rosterQuery.data) {
    const error = rosterQuery.error;
    if (
      isMockAuthorizationError(error) &&
      (error.code === "ownership" || error.code === "forbidden")
    ) {
      return <AccessDenied kind="ownership" homeHref="/schedule" />;
    }
    return (
      <AdminPageShell title="Roster" breadcrumb={[{ label: "Schedule", href: "/schedule" }]}>
        <FeedbackState
          id="calendar.load-failed"
          title="Roster could not load"
          description="This session roster did not load. Retry the request or return to the schedule."
          actionLabel="Retry"
          onAction={() => {
            void rosterQuery.refetch();
          }}
        />
      </AdminPageShell>
    );
  }

  const roster = rosterQuery.data;
  const occ = occupancyRatio(roster.confirmedCount, roster.capacity);
  const att = attendanceUtilisation(roster.checkedIn, roster.capacity);
  const title = sessionDisplayName(roster.session);

  return (
    <AdminPageShell
      className="max-w-6xl overflow-x-hidden"
      eyebrow="Live session roster"
      title={title}
      description={`${formatSessionDate(roster.session.startsAt)} · ${formatSessionTime(roster.session.startsAt)} · ${roster.session.coachName}`}
      breadcrumb={[{ label: "Schedule", href: "/schedule" }, { label: "Roster" }]}
      stats={
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Checked in" value={roster.checkedIn} emphasis />
          <Metric label="Confirmed" value={roster.confirmedCount} />
          <Metric label="Places available" value={roster.available} />
          <Metric label="Waitlisted" value={roster.waitlistedCount} />
        </dl>
      }
    >
      <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              Session health
            </p>
            <h2 className="mt-1 font-display text-2xl">Capacity and attendance</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {roster.confirmedCount + roster.heldCount + roster.available} of {roster.capacity}{" "}
            places accounted for
          </p>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-border/70 pt-5 text-sm sm:grid-cols-5">
          <Metric label="Capacity" value={roster.capacity} compact />
          <Metric label="Held" value={roster.heldCount} />
          <Metric label="No-show" value={roster.noShow} />
          <Metric label="Occupancy" value={formatRatioPercent(occ)} />
          <Metric label="Attendance" value={formatRatioPercent(att)} />
        </dl>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.75fr)]">
        <div className="grid gap-6">
          <RosterGroup
            title="Confirmed guests"
            rows={roster.confirmed}
            showPayment={canReadPayments}
            onCheckIn={(id) => checkIn.mutateAsync(id)}
            onNoShow={(id) => markNoShow.mutateAsync(id)}
          />
          <RosterGroup
            title="Held / pending"
            rows={roster.held}
            showPayment={canReadPayments}
            onCheckIn={(id) => checkIn.mutateAsync(id)}
            onNoShow={(id) => markNoShow.mutateAsync(id)}
          />
        </div>
        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="border-b border-border/70 bg-muted/25 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl">Waitlist</h2>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums">
                {roster.waitlisted.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">First in, first offered.</p>
          </div>
          <ol className="divide-y divide-border/70">
            {roster.waitlisted.map((row, index) => (
              <li key={row.id} className="flex items-center gap-3 p-4 hover:bg-muted/20">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.customerName}</p>
                  <AdminCan href="/bookings">
                    <Link
                      className="text-sm text-muted-foreground underline underline-offset-4"
                      href={`/bookings/${row.id}`}
                    >
                      Inspect booking
                    </Link>
                  </AdminCan>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </AdminPageShell>
  );
}

function Metric({
  label,
  value,
  emphasis = false,
  compact = false,
}: {
  label: string;
  value: string | number;
  emphasis?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={emphasis ? "rounded-xl bg-primary p-3 text-primary-foreground" : undefined}>
      <dt
        className={
          emphasis ? "text-xs text-primary-foreground/70" : "text-xs text-muted-foreground"
        }
      >
        {label}
      </dt>
      <dd
        className={
          compact
            ? "mt-1 text-xl font-semibold tabular-nums"
            : "mt-1 text-2xl font-semibold tabular-nums"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function RosterGroup({
  title,
  rows,
  showPayment,
  onCheckIn,
  onNoShow,
}: {
  title: string;
  rows: CustomerBooking[];
  showPayment: boolean;
  onCheckIn: (bookingId: string) => Promise<unknown>;
  onNoShow: (bookingId: string) => Promise<unknown>;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/25 p-4 sm:p-5">
        <h2 className="font-display text-2xl">{title}</h2>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums">
          {rows.length}
        </span>
      </div>
      <ul className="divide-y divide-border/70">
        {rows.map((row) => (
          <li key={row.id} className="p-4 transition-colors hover:bg-muted/20 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{row.customerName}</p>
                {showPayment ? (
                  <p className="text-sm">Payment: {paymentStatusLabel(row.paymentStatus)}</p>
                ) : null}
                <p className="text-sm">
                  Attendance: <StatusBadge status={row.status} surface="admin" />
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AdminCan action="attendance">
                  <ConfirmAction
                    triggerLabel="Check In"
                    title="Check this guest in?"
                    description="Attendance updates immediately in this mock."
                    onConfirm={async () => {
                      try {
                        await onCheckIn(row.id);
                        notify.admin("booking.checked-in");
                      } catch {
                        notify.admin("booking.check-in-failed");
                      }
                    }}
                  />
                  <ConfirmAction
                    triggerLabel="Mark no-show"
                    title="Mark as no-show?"
                    description={NO_REFUND_ON_NOSHOW_NOTE}
                    variant="outline"
                    onConfirm={async () => {
                      try {
                        await onNoShow(row.id);
                        notify.success({
                          title: "Marked no-show",
                          description: "Attendance is recorded for this booking.",
                        });
                      } catch {
                        notify.admin("booking.check-in-failed");
                      }
                    }}
                  />
                </AdminCan>
                <AdminCan href="/bookings">
                  <Link
                    className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4"
                    href={`/bookings/${row.id}`}
                  >
                    Inspect booking/payment
                  </Link>
                </AdminCan>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
