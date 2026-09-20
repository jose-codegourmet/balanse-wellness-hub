"use client";

import {
  type AdminCustomer,
  type AdminCustomerDetail,
  bookingListTab,
  formatSessionDate,
  paymentStatusLabel,
  refundStatusLabel,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { FeedbackState, LocalizedSkeleton, StatusBadge } from "@balanse/ui";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminDataTable } from "@/components/balanse/AdminDataTable";
import { PageHeader } from "./shared";

export function CustomerListPage({ empty }: { empty?: boolean }) {
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [rows, setRows] = useState<AdminCustomer[] | null>(null);

  useEffect(() => {
    void getMockAdapter()
      .getAdminCustomers({ hasUpcoming: upcomingOnly || undefined })
      .then((list) => setRows(empty ? [] : list));
  }, [empty, upcomingOnly]);

  const columns = useMemo<ColumnDef<AdminCustomer, unknown>[]>(
    () => [
      { accessorKey: "fullName", header: "Name" },
      {
        id: "contact",
        header: "Contact",
        accessorFn: (row) => `${row.email} ${row.contactNumber}`,
        cell: ({ row }) => (
          <span>
            {row.original.email}
            <br />
            {row.original.contactNumber}
          </span>
        ),
      },
      { accessorKey: "upcomingCount", header: "Upcoming" },
      {
        id: "lastVisit",
        header: "Last Visit",
        accessorFn: (row) => row.lastVisitAt ?? "",
        cell: ({ row }) =>
          row.original.lastVisitAt ? formatSessionDate(row.original.lastVisitAt) : "—",
      },
      {
        id: "view",
        header: "View",
        enableSorting: false,
        cell: ({ row }) => (
          <Link className="underline underline-offset-4" href={`/customers/${row.original.id}`}>
            View
          </Link>
        ),
      },
    ],
    [],
  );

  if (!rows) return <LocalizedSkeleton lines={6} label="Loading customers" />;

  return (
    <section>
      <PageHeader title="Customers" />
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(event) => setUpcomingOnly(event.target.checked)}
          />
          Filters: upcoming only
        </label>
      </div>
      {rows.length === 0 ? (
        <FeedbackState
          id="admin.no-customers"
          className="mt-6"
          onAction={() => {
            setUpcomingOnly(false);
          }}
        />
      ) : (
        <div className="mt-4">
          <AdminDataTable
            data={rows}
            columns={columns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search customers"
            emptyLabel="No customers match your filter."
          />
        </div>
      )}
    </section>
  );
}

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
                  {booking.session.className} · {formatSessionDate(booking.session.startsAt)}
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
  const [detail, setDetail] = useState<AdminCustomerDetail | null>(null);

  useEffect(() => {
    void getMockAdapter().getAdminCustomer(customerId).then(setDetail);
  }, [customerId]);

  if (!detail) return <LocalizedSkeleton lines={8} label="Loading customer" />;

  return (
    <section>
      <PageHeader title={detail.fullName} />
      <h2 className="mt-6 font-display text-2xl">Profile</h2>
      <dl className="mt-3 grid gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{detail.email}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Contact</dt>
          <dd>{detail.contactNumber}</dd>
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
                <Link className="underline underline-offset-4" href={`/bookings/${booking.id}`}>
                  {booking.session.className}
                </Link>
                <p>Payment status: {paymentStatusLabel(booking.paymentStatus)}</p>
                <p>
                  Refund status:{" "}
                  {booking.refundStatus === "NOT_APPLICABLE"
                    ? "Not applicable"
                    : refundStatusLabel(booking.refundStatus)}
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
    </section>
  );
}
