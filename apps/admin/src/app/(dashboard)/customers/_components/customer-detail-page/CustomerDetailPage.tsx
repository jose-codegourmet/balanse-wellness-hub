"use client";

import {
  type AdminCustomerDetail,
  bookingListTab,
  formatSessionDate,
  paymentStatusLabel,
  refundStatusLabel,
  sessionDisplayName,
} from "@balanse/domain";
import { Badge, StatusBadge } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { adminCustomerDetailQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

function BookingBlock({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: AdminCustomerDetail["upcoming"];
}) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((booking) => (
            <li key={booking.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link className="underline underline-offset-4" href={`/bookings/${booking.id}`}>
                  {sessionDisplayName(booking.session)} ·{" "}
                  {formatSessionDate(booking.session.startsAt)}
                </Link>
                <StatusBadge status={booking.status} surface="admin" />
              </div>
              {bookingListTab(booking.status) === "history" ? null : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CustomerDetailPage({ customerId }: { customerId: string }) {
  const { principal } = useMockPrincipal();
  const query = useSuspenseQuery(adminCustomerDetailQuery(principal.role, customerId));
  const detail = query.data;
  if (!detail) return null;

  return (
    <AdminPageShell
      title={detail.fullName}
      breadcrumb={[{ label: "Customers", href: "/customers" }, { label: detail.fullName }]}
    >
      <h2 className="font-display text-2xl">Profile</h2>
      <dl className="mt-3 grid gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{detail.email}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Contact</dt>
          <dd>{detail.contactNumber}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Upcoming</dt>
          <dd>
            <Badge
              variant={detail.upcomingCount > 0 ? "info" : "neutral"}
              appearance={detail.upcomingCount > 0 ? "solid" : "soft"}
              size="sm"
            >
              {detail.upcomingCount}
            </Badge>
          </dd>
        </div>
      </dl>

      <BookingBlock title="Upcoming" empty="No upcoming bookings." rows={detail.upcoming} />
      <BookingBlock title="Pending" empty="No pending bookings." rows={detail.pending} />
      <BookingBlock title="History" empty="No booking history." rows={detail.history} />
      <BookingBlock
        title="Cancellation / reschedule history"
        empty="No cancellation or reschedule history."
        rows={detail.requestHistory}
      />
      <BookingBlock
        title="Attendance / no-show history"
        empty="No attendance history."
        rows={detail.attendanceHistory}
      />

      <section className="mt-8">
        <h2 className="font-display text-2xl">Payment / refund history</h2>
        {detail.paymentHistory.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No payment or refund history.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {detail.paymentHistory.map((booking) => (
              <li key={booking.id} className="rounded-xl border border-border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link className="underline underline-offset-4" href={`/bookings/${booking.id}`}>
                    {sessionDisplayName(booking.session)}
                  </Link>
                  <StatusBadge status={booking.status} surface="admin" />
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">Payment</span>
                  <Badge appearance="soft" size="sm">
                    {paymentStatusLabel(booking.paymentStatus)}
                  </Badge>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">Refund</span>
                  <Badge appearance="soft" size="sm">
                    {booking.refundStatus === "NOT_APPLICABLE"
                      ? "Not applicable"
                      : refundStatusLabel(booking.refundStatus)}
                  </Badge>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl">Accepted policy versions</h2>
        {detail.policyAcceptances.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No accepted policy versions.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {detail.policyAcceptances.map((row) => (
              <li key={`${row.documentName}-${row.version}`}>
                {row.documentName} · {row.version} · {formatSessionDate(row.acceptedAt)}
              </li>
            ))}
          </ul>
        )}
      </section>
      <Link className="mt-8 inline-flex text-sm underline underline-offset-4" href="/customers">
        Back to customers
      </Link>
    </AdminPageShell>
  );
}
