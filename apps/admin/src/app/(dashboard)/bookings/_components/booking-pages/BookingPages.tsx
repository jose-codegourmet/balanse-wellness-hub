"use client";

import {
  ADMIN_BOOKING_TABS,
  type AdminBookingTab,
  auditConfirmationCopy,
  type CustomerBooking,
  customerStatusLabel,
  filterAdminBookings,
  formatPeso,
  formatSessionDate,
  formatSessionRange,
  formatSessionTimeRange,
  paymentStatusLabel,
  refundStatusLabel,
  sessionDisplayName,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button, Input, Label, NativeSelect, StatusBadge } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, XIcon } from "lucide-react";
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
import { AdminCan } from "@/modules/authorization/useAdminAccess";
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
  const { data: bookings } = useSuspenseQuery(adminBookingsQuery(principal));
  const { data: classes } = useSuspenseQuery(adminClassesQuery(principal));
  const { data: customers } = useSuspenseQuery(adminCustomersQuery(principal));

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
        meta: { mobile: { role: "subtitle" } },
      },
      {
        id: "time",
        header: "Time",
        accessorFn: (row) => formatSessionRange(row.session.startsAt, row.session.endsAt),
        meta: { mobile: { role: "meta" } },
        cell: ({ row }) => (
          <span className="grid gap-0.5 whitespace-nowrap">
            <span>{formatSessionDate(row.original.session.startsAt)}</span>
            <span className="text-xs text-muted-foreground">
              {formatSessionTimeRange(row.original.session.startsAt, row.original.session.endsAt)}
            </span>
          </span>
        ),
      },
      {
        id: "payment",
        header: "Payment",
        accessorFn: (row) => paymentStatusLabel(row.paymentStatus),
        meta: { mobile: { role: "meta" } },
        cell: ({ getValue }) => <span className="whitespace-nowrap">{String(getValue())}</span>,
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
          <Button
            nativeButton={false}
            variant="ghost"
            size="xs"
            className="-mr-2"
            render={<Link href={`/bookings/${row.original.id}`} />}
          >
            Review
            <ArrowRightIcon aria-hidden />
          </Button>
        ),
      },
    ],
    [names],
  );

  return (
    <AdminPageShell
      eyebrow="Operations queue"
      title="Bookings"
      description="Review booking requests, verify payment progress, and keep every class roster moving."
      stats={
        <dl className="grid grid-cols-3 gap-3">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Current queue</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{filtered.length}</dd>
          </div>
          <div className="border-l border-border pl-3 sm:pl-5">
            <dt className="text-xs font-medium text-muted-foreground">All bookings</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{bookings.length}</dd>
          </div>
          <div className="border-l border-border pl-3 sm:pl-5">
            <dt className="text-xs font-medium text-muted-foreground">Classes</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{classes.length}</dd>
          </div>
        </dl>
      }
      tabs={
        <AdminPageTabs
          tabs={ADMIN_BOOKING_TABS}
          value={tab}
          onValueChange={(id) => {
            setTab(id as AdminBookingTab);
          }}
        >
          <AdminDataTable
            tableId="bookings"
            data={filtered}
            columns={columns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search customer"
            emptyFilterLabel="No bookings match these filters."
            toolbar={
              <>
                <NativeSelect
                  id="booking-class"
                  aria-label="Class"
                  size="sm"
                  className="w-44"
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
                <div className="relative">
                  <CalendarIcon
                    className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="booking-date"
                    aria-label="Date"
                    type="date"
                    size="sm"
                    className="w-40 pl-8"
                    value={date}
                    onChange={(event) => {
                      setDate(event.target.value);
                    }}
                  />
                </div>
                {classId !== "all" || date ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setClassId("all");
                      setDate("");
                    }}
                  >
                    <XIcon aria-hidden />
                    Clear
                  </Button>
                ) : null}
              </>
            }
          />
        </AdminPageTabs>
      }
    />
  );
}

export function BookingDetailPage({ bookingId }: { bookingId: string }) {
  const { principal } = useMockPrincipal();
  const bookingQuery = useSuspenseQuery(adminBookingDetailQuery(principal, bookingId));
  const { data: customers } = useSuspenseQuery(adminCustomersQuery(principal));
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

  if (booking.status === "CANCELLED") {
    return (
      <CancelledBookingDetail
        booking={booking}
        customerName={name}
        onRefundComplete={() => getMockAdapter().markRefunded(booking.id).then(refresh)}
      />
    );
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
          <AdminCan action="refunds-read">
            <p className="text-sm">Refund: {refundStatusLabel(booking.refundStatus)}</p>
          </AdminCan>
        ) : null}
      </div>
      {policies ? <p className="mt-3 text-sm">{policies}</p> : null}
      {proofOpen && booking.proofPreviewUrl ? (
        <dialog
          open
          className="fixed inset-8 z-50 mx-auto max-w-3xl rounded-xl border bg-background p-4"
        >
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mb-2"
            onClick={() => setProofOpen(false)}
          >
            Close
          </Button>
          <img
            src={booking.proofPreviewUrl}
            alt="Payment proof"
            className="max-h-[80vh] w-full object-contain"
          />
        </dialog>
      ) : null}
      <div className="mt-6 grid gap-3">
        <AdminCan action="bookings-confirm">
          <ConfirmAction
            triggerLabel="Confirm"
            title="Confirm this booking?"
            description={actorStamp}
            onConfirm={() => getMockAdapter().confirmAdminBooking(booking.id).then(refresh)}
          />
        </AdminCan>
        <AdminCan action="bookings-reject">
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
              onConfirm={() =>
                getMockAdapter().rejectAdminBooking(booking.id, reason).then(refresh)
              }
            />
          </div>
        </AdminCan>
        <AdminCan action="payments-review">
          <Button type="button" variant="outline" onClick={() => setProofOpen(true)}>
            View proof
          </Button>
        </AdminCan>
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
        <AdminCan href="/cancellations">
          <Link className="underline underline-offset-4" href="/cancellations">
            Open cancellation request
          </Link>
        </AdminCan>
        <AdminCan href="/reschedules">
          <Link className="underline underline-offset-4" href="/reschedules">
            Open reschedule request
          </Link>
        </AdminCan>
        <AdminCan action="attendance">
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
        </AdminCan>
      </div>
    </AdminPageShell>
  );
}

function CancelledBookingDetail({
  booking,
  customerName,
  onRefundComplete,
}: {
  booking: CustomerBooking;
  customerName: string;
  onRefundComplete: () => Promise<void>;
}) {
  const hasRefund = booking.refundStatus !== "NOT_APPLICABLE";

  return (
    <AdminPageShell
      className="max-w-4xl"
      eyebrow="Closed booking"
      title="Booking cancelled"
      description="This reservation is closed and cannot be checked in, rescheduled, or reopened here."
      breadcrumb={[{ label: "Bookings", href: "/bookings" }, { label: customerName }]}
      actions={
        <Button nativeButton={false} variant="outline" render={<Link href="/bookings" />}>
          <ArrowLeftIcon aria-hidden />
          Back to bookings
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(16rem,.85fr)]">
        <article className="rounded-xl border border-destructive/35 border-l-4 border-l-destructive bg-destructive/5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.14em] text-destructive uppercase">
                Cancellation confirmed
              </p>
              <h2 className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">
                {customerName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {sessionDisplayName(booking.session)} ·{" "}
                {formatSessionRange(booking.session.startsAt, booking.session.endsAt)}
              </p>
            </div>
            <StatusBadge status={booking.status} surface="admin" />
          </div>

          <dl className="mt-6 grid gap-4 border-t border-destructive/20 pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Booking reference</dt>
              <dd className="mt-1 font-mono text-sm">{booking.id}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Payment status</dt>
              <dd className="mt-1 text-sm font-medium">
                {paymentStatusLabel(booking.paymentStatus)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">Cancellation note</dt>
              <dd className="mt-1 text-sm leading-6">
                {booking.cancellationReason ?? "No cancellation note was recorded."}
              </dd>
            </div>
          </dl>
        </article>

        <aside
          className="rounded-xl border border-border bg-muted/25 p-5"
          aria-labelledby="cancelled-next-steps"
        >
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            What happens next
          </p>
          <h2 id="cancelled-next-steps" className="mt-2 font-display text-xl tracking-tight">
            The booking is complete
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The customer no longer has a place in this session. Review the refund record below when
            one applies.
          </p>
        </aside>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-2" aria-label="Cancelled booking follow-up">
        <AdminCan action="refunds-read">
          <article className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Refund record
            </p>
            {hasRefund ? (
              <>
                <h2 className="mt-2 font-display text-2xl tracking-tight">
                  {refundStatusLabel(booking.refundStatus)}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {formatPeso(booking.session.pricePhp)} from the original booking payment.
                </p>
                {booking.refundStatus === "REFUND_PENDING" ? (
                  <AdminCan action="refunds-manage">
                    <div className="mt-5">
                      <ConfirmAction
                        triggerLabel="Mark refund complete"
                        title="Mark this refund complete?"
                        description="This records the refund status only; money moves outside the app."
                        onConfirm={onRefundComplete}
                      />
                    </div>
                  </AdminCan>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                No refund is recorded for this booking.
              </p>
            )}
            <AdminCan href="/payments">
              <Link
                href="/payments?tab=refunds"
                className="mt-5 inline-flex text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Open refund queue
              </Link>
            </AdminCan>
          </article>
        </AdminCan>

        <article className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Next action
          </p>
          <h2 className="mt-2 font-display text-2xl tracking-tight">No booking action remains</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Return to the booking list to review another reservation or use the refund queue when a
            payment follow-up is needed.
          </p>
          <Button
            className="mt-5"
            nativeButton={false}
            variant="outline"
            render={<Link href="/bookings" />}
          >
            View bookings
          </Button>
        </article>
      </section>
    </AdminPageShell>
  );
}
