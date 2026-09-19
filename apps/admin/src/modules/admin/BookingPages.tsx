"use client";

import {
  ADMIN_BOOKING_PAGE_SIZE,
  ADMIN_BOOKING_TABS,
  type AdminBookingTab,
  type AdminClass,
  auditConfirmationCopy,
  type CustomerBooking,
  filterAdminBookings,
  formatSessionRange,
  paginateRows,
  paymentStatusLabel,
  refundStatusLabel,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button, Input, Label, LocalizedSkeleton, NativeSelect, StatusBadge } from "@balanse/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ConfirmAction, DataTable, PageHeader } from "./shared";

function customerNameLookup(customers: { id: string; fullName: string }[]) {
  return (id: string) => customers.find((row) => row.id === id)?.fullName ?? id;
}

export function BookingListPage() {
  const params = useSearchParams();
  const [tab, setTab] = useState<AdminBookingTab>(
    (params.get("tab") as AdminBookingTab) || "pending",
  );
  const [query, setQuery] = useState("");
  const [classId, setClassId] = useState("all");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState<CustomerBooking[] | null>(null);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [customers, setCustomers] = useState<{ id: string; fullName: string }[]>([]);

  useEffect(() => {
    void Promise.all([
      getMockAdapter().getAdminBookings(),
      getMockAdapter().getAdminClasses(),
      getMockAdapter().getAdminCustomers(),
    ]).then(([rows, classRows, customerRows]) => {
      setBookings(rows);
      setClasses(classRows);
      setCustomers(customerRows);
    });
  }, []);

  const names = useMemo(() => customerNameLookup(customers), [customers]);
  const filtered = useMemo(
    () => (bookings ? filterAdminBookings(bookings, { tab, query, classId, date }, names) : []),
    [bookings, classId, date, names, query, tab],
  );
  const pageRows = paginateRows(filtered, page);
  const pages = Math.max(1, Math.ceil(filtered.length / ADMIN_BOOKING_PAGE_SIZE));

  if (!bookings) return <LocalizedSkeleton lines={8} label="Loading bookings" />;

  return (
    <section>
      <PageHeader title="Bookings" />
      <div className="mt-4 flex flex-wrap gap-2">
        {ADMIN_BOOKING_TABS.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={tab === item.id ? "default" : "outline"}
            onClick={() => {
              setTab(item.id);
              setPage(1);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="booking-search">Search Customer</Label>
          <Input
            id="booking-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="booking-class">Class</Label>
          <NativeSelect
            id="booking-class"
            value={classId}
            onChange={(event) => {
              setClassId(event.target.value);
              setPage(1);
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
              setPage(1);
            }}
          />
        </div>
      </div>
      <DataTable columns={["Customer", "Class", "Time", "Payment", "Status", "Review"]}>
        {pageRows.map((booking) => (
          <tr key={booking.id} className="border-t border-border">
            <td className="px-3 py-2">{names(booking.customerId)}</td>
            <td className="px-3 py-2">{booking.session.className}</td>
            <td className="px-3 py-2">
              {formatSessionRange(booking.session.startsAt, booking.session.endsAt)}
            </td>
            <td className="px-3 py-2">{paymentStatusLabel(booking.paymentStatus)}</td>
            <td className="px-3 py-2">
              <StatusBadge status={booking.status} surface="admin" />
            </td>
            <td className="px-3 py-2">
              <Link className="underline underline-offset-4" href={`/bookings/${booking.id}`}>
                Review
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
      <div className="mt-4 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <p className="text-sm">
          Page {page} of {pages}
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </section>
  );
}

export function BookingDetailPage({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<CustomerBooking | null>(null);
  const [customers, setCustomers] = useState<{ id: string; fullName: string }[]>([]);
  const [reason, setReason] = useState("");
  const [proofOpen, setProofOpen] = useState(false);
  const [policies, setPolicies] = useState<string | null>(null);
  const actorStamp = auditConfirmationCopy(
    "This booking action",
    "Admin",
    "2026-09-16T02:50:00.000Z",
  );

  useEffect(() => {
    void Promise.all([
      getMockAdapter().getBooking(bookingId),
      getMockAdapter().getAdminCustomers(),
    ]).then(([row, customerRows]) => {
      setBooking(row);
      setCustomers(customerRows);
    });
  }, [bookingId]);

  if (!booking) return <LocalizedSkeleton lines={8} label="Loading booking" />;
  const name =
    customers.find((row) => row.id === booking.customerId)?.fullName ?? booking.customerId;

  async function refresh() {
    setBooking(await getMockAdapter().getBooking(bookingId));
  }

  return (
    <section className="max-w-2xl">
      <PageHeader title="Booking detail" />
      <p className="mt-3 font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">
        {booking.session.className} ·{" "}
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
          {/* biome-ignore lint/performance/noImgElement: zoomable mock proof from fixture path */}
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
    </section>
  );
}
