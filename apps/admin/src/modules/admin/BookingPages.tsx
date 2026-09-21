"use client";

import {
  ADMIN_BOOKING_TABS,
  type AdminBookingTab,
  auditConfirmationCopy,
  type CustomerBooking,
  customerStatusLabel,
  filterAdminBookings,
  formatSessionRange,
  paymentStatusLabel,
  refundStatusLabel,
  sessionDisplayName,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button, Input, Label, NativeSelect, StatusBadge } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminDataTable } from "@/components/balanse/data-table/admin-data-table/AdminDataTable";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { AdminPageTabs } from "@/components/balanse/page/admin-page-tabs/AdminPageTabs";
import { adminNowIso } from "@/lib/clock";
import {
  adminBookingDetailQuery,
  adminBookingsQuery,
  adminClassesQuery,
  adminCustomersQuery,
} from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

function customerNameLookup(customers: { id: string; fullName: string }[]) {
  return (id: string) => customers.find((row) => row.id === id)?.fullName ?? id;
}

export function BookingListPage() {
  const params = useSearchParams();
  const { principal } = useMockPrincipal();
  const [tab, setTab] = useState<AdminBookingTab>(
    (params.get("tab") as AdminBookingTab) || "pending",
  );
  const [classId, setClassId] = useState("all");
  const [date, setDate] = useState("");
  const { data: bookings } = useSuspenseQuery(adminBookingsQuery(principal.role));
  const { data: classes } = useSuspenseQuery(adminClassesQuery(principal.role));
  const { data: customers } = useSuspenseQuery(adminCustomersQuery(principal.role));

  const names = useMemo(() => customerNameLookup(customers), [customers]);
  const filtered = useMemo(
    () => (bookings ? filterAdminBookings(bookings, { tab, query: "", classId, date }, names) : []),
    [bookings, classId, date, names, tab],
  );
  const columns = useMemo<ColumnDef<CustomerBooking, unknown>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        accessorFn: (row) => names(row.customerId),
        meta: { primaryLink: (row) => `/bookings/${row.id}`, mobile: { role: "title" } },
      },
      {
        id: "class",
        header: "Class",
        accessorFn: (row) => sessionDisplayName(row.session),
        enableColumnFilter: true,
        meta: { enableFaceting: true, facetLabel: "Class", mobile: { role: "subtitle" } },
      },
      {
        id: "time",
        header: "Time",
        accessorFn: (row) => formatSessionRange(row.session.startsAt, row.session.endsAt),
        meta: { mobile: { role: "meta" } },
      },
      {
        id: "payment",
        header: "Payment",
        accessorFn: (row) => paymentStatusLabel(row.paymentStatus),
        meta: { mobile: { role: "meta" } },
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => customerStatusLabel(row.status),
        enableColumnFilter: true,
        meta: { enableFaceting: true, facetLabel: "Status", mobile: { role: "status" } },
        cell: ({ row }) => <StatusBadge status={row.original.status} surface="admin" />,
      },
      {
        id: "review",
        header: "Review",
        enableSorting: false,
        meta: { mobile: { role: "hidden" } },
        cell: ({ row }) => (
          <Link className="underline underline-offset-4" href={`/bookings/${row.original.id}`}>
            Review
          </Link>
        ),
      },
    ],
    [names],
  );

  return (
    <AdminPageShell
      title="Bookings"
      tabs={
        <AdminPageTabs
          tabs={ADMIN_BOOKING_TABS}
          value={tab}
          onValueChange={(id) => {
            setTab(id as AdminBookingTab);
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="booking-class">Class</Label>
              <NativeSelect
                id="booking-class"
                value={classId}
                onChange={(event) => {
                  setClassId(event.target.value);
                }}
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
              <Label htmlFor="booking-date">Date</Label>
              <Input
                id="booking-date"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                }}
              />
            </div>
          </div>
          <div className="mt-6">
            <AdminDataTable
              tableId="bookings"
              data={filtered}
              columns={columns}
              getRowId={(row) => row.id}
              searchPlaceholder="Search customer"
              emptyFilterLabel="No bookings match these filters."
            />
          </div>
        </AdminPageTabs>
      }
    />
  );
}

export function BookingDetailPage({ bookingId }: { bookingId: string }) {
  const { principal } = useMockPrincipal();
  const bookingQuery = useSuspenseQuery(adminBookingDetailQuery(principal.role, bookingId));
  const { data: customers } = useSuspenseQuery(adminCustomersQuery(principal.role));
  const booking = bookingQuery.data;
  const [reason, setReason] = useState("");
  const [proofOpen, setProofOpen] = useState(false);
  const [policies, setPolicies] = useState<string | null>(null);
  const actorStamp = auditConfirmationCopy("This booking action", "Admin", adminNowIso());

  if (!booking) return null;
  const name =
    customers.find((row) => row.id === booking.customerId)?.fullName ?? booking.customerId;

  async function refresh() {
    await bookingQuery.refetch();
  }

  return (
    <AdminPageShell
      className="max-w-2xl"
      title="Booking detail"
      breadcrumb={[{ label: "Bookings", href: "/bookings" }, { label: name }]}
    >
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">
        {sessionDisplayName(booking.session)} ·{" "}
        {formatSessionRange(booking.session.startsAt, booking.session.endsAt)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge status={booking.status} surface="admin" />
        <p className="text-sm">Payment: {paymentStatusLabel(booking.paymentStatus)}</p>
        {booking.refundStatus !== "NOT_APPLICABLE" ? (
          <p className="text-sm">Refund: {refundStatusLabel(booking.refundStatus)}</p>
        ) : null}
      </div>
      {policies ? <p className="mt-3 text-sm">{policies}</p> : null}
      {proofOpen && booking.proofPreviewUrl ? (
        <dialog
          open
          className="fixed inset-8 z-50 mx-auto max-w-3xl rounded-xl border bg-background p-4"
        >
          <button type="button" className="mb-2 underline" onClick={() => setProofOpen(false)}>
            Close
          </button>
          <img
            src={booking.proofPreviewUrl}
            alt="Payment proof"
            className="max-h-[80vh] w-full object-contain"
          />
        </dialog>
      ) : null}
      <div className="mt-6 grid gap-3">
        <ConfirmAction
          triggerLabel="Confirm"
          title="Confirm this booking?"
          description={actorStamp}
          onConfirm={() => getMockAdapter().confirmAdminBooking(booking.id).then(refresh)}
        />
        <div className="grid gap-2">
          <Label htmlFor="reject-reason">Reject reason</Label>
          <Input
            id="reject-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <ConfirmAction
            triggerLabel="Reject"
            title="Reject this booking?"
            description={`${actorStamp} A free-text reason is stored. Refund eligibility rules are not implied.`}
            variant="outline"
            disabled={!reason.trim()}
            onConfirm={() => getMockAdapter().rejectAdminBooking(booking.id, reason).then(refresh)}
          />
        </div>
        <Button type="button" variant="outline" onClick={() => setProofOpen(true)}>
          View proof
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            void getMockAdapter()
              .getAdminCustomer(booking.customerId)
              .then((detail) => {
                const accepted = detail?.policyAcceptances ?? [];
                setPolicies(
                  accepted.length
                    ? accepted.map((row) => `${row.documentName} ${row.version}`).join(" · ")
                    : "No policy acceptance on file.",
                );
              })
          }
        >
          View policy acceptance
        </Button>
        <Link className="underline underline-offset-4" href="/cancellations">
          Open cancellation request
        </Link>
        <Link className="underline underline-offset-4" href="/reschedules">
          Open reschedule request
        </Link>
        <ConfirmAction
          triggerLabel="Check in"
          title="Check this guest in?"
          description={actorStamp}
          onConfirm={() => getMockAdapter().checkIn(booking.id).then(refresh)}
        />
        <ConfirmAction
          triggerLabel="Mark no-show"
          title="Mark as no-show?"
          description={`${actorStamp} No refund is issued.`}
          variant="outline"
          onConfirm={() => getMockAdapter().markNoShow(booking.id).then(refresh)}
        />
      </div>
    </AdminPageShell>
  );
}
