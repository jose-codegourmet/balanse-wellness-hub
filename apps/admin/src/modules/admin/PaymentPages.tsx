"use client";

import {
  type AdminPaymentTab,
  auditConfirmationCopy,
  type CustomerBooking,
  filterPaymentQueue,
  formatHoldDeadline,
  formatPeso,
  paymentStatusLabel,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button, FeedbackState, Input, Label, LocalizedSkeleton, StatusBadge } from "@balanse/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { AdminDataTable } from "@/components/balanse/data-table/AdminDataTable";
import { ConfirmAction, PageHeader } from "./shared";

const TABS: { id: AdminPaymentTab; label: string }[] = [
  { id: "gcash", label: "GCash Pending" },
  { id: "counter", label: "Pay at Counter" },
  { id: "refunds", label: "Refunds" },
];

export function PaymentReviewPage({ empty }: { empty?: boolean }) {
  const [tab, setTab] = useState<AdminPaymentTab>("gcash");
  const [bookings, setBookings] = useState<CustomerBooking[] | null>(null);
  const [customers, setCustomers] = useState<{ id: string; fullName: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [zoom, setZoom] = useState(false);
  const stamp = auditConfirmationCopy("This payment action", "Admin", "2026-09-16T02:50:00.000Z");

  useEffect(() => {
    void Promise.all([
      getMockAdapter().getAdminPayments(),
      getMockAdapter().getAdminCustomers(),
    ]).then(([rows, people]) => {
      setBookings(empty ? [] : rows);
      setCustomers(people);
    });
  }, [empty]);

  const columns = useMemo<ColumnDef<CustomerBooking, unknown>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        accessorFn: (row) =>
          customers.find((person) => person.id === row.customerId)?.fullName ?? row.customerId,
      },
      {
        id: "session",
        header: "Session",
        accessorFn: (row) => row.session.className,
      },
      {
        id: "amount",
        header: "Amount",
        accessorFn: (row) => row.session.pricePhp,
        cell: ({ row }) => formatPeso(row.original.session.pricePhp),
      },
      {
        id: "hold",
        header: "Hold Expiry",
        accessorFn: (row) => row.holdExpiresAt ?? "",
        cell: ({ row }) =>
          row.original.holdExpiresAt
            ? formatHoldDeadline(row.original.holdExpiresAt, row.original.session.startsAt)
            : "—",
      },
    ],
    [customers],
  );

  if (!bookings) return <LocalizedSkeleton lines={7} label="Loading payments" />;
  const queue = filterPaymentQueue(bookings, tab);
  const selected = queue.find((row) => row.id === selectedId) ?? queue[0] ?? null;

  async function refresh() {
    setBookings(await getMockAdapter().getAdminPayments());
  }

  return (
    <section>
      <PageHeader title="Payments" />
      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={tab === item.id ? "default" : "outline"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {queue.length === 0 ? (
        <FeedbackState id="admin.no-pending-payments" className="mt-6" />
      ) : (
        <div className="mt-6">
          <AdminDataTable
            tableId="payments"
            data={queue}
            columns={columns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search payments"
            emptyFilterLabel="No payments in this queue."
            onRowClick={(row) => setSelectedId(row.id)}
          />
        </div>
      )}

      {selected ? (
        <aside className="mt-8 rounded-xl border border-border p-4">
          <p className="text-sm">
            Booking status: <StatusBadge status={selected.status} surface="admin" />
          </p>
          <p className="mt-2 text-sm">
            Payment status: {paymentStatusLabel(selected.paymentStatus)}
          </p>
          {selected.proofPreviewUrl ? (
            <button type="button" className="mt-4 block" onClick={() => setZoom(true)}>
              {/* biome-ignore lint/performance/noImgElement: zoomable mock proof from fixture path */}
              <img
                src={selected.proofPreviewUrl}
                alt="Payment proof preview"
                className="max-h-48 rounded-md border"
              />
            </button>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No screenshot for cash payments.</p>
          )}
          {zoom && selected.proofPreviewUrl ? (
            <dialog
              open
              className="fixed inset-8 z-50 max-w-3xl rounded-xl border bg-background p-4"
            >
              <button type="button" className="mb-2 underline" onClick={() => setZoom(false)}>
                Close
              </button>
              {/* biome-ignore lint/performance/noImgElement: zoomable mock proof from fixture path */}
              <img
                src={selected.proofPreviewUrl}
                alt="Payment proof enlarged"
                className="max-h-[80vh] w-full object-contain"
              />
            </dialog>
          ) : null}

          {tab === "counter" ? (
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
              <li>Find the held booking in this list.</li>
              <li>Receive cash at the counter.</li>
              <li>
                <ConfirmAction
                  triggerLabel="Record payment"
                  title="Record cash received?"
                  description={stamp}
                  onConfirm={() => getMockAdapter().recordCash(selected.id).then(refresh)}
                />
              </li>
              <li>
                <ConfirmAction
                  triggerLabel="Confirm Payment & Booking"
                  title="Confirm payment and booking?"
                  description={stamp}
                  onConfirm={() => getMockAdapter().confirmAdminBooking(selected.id).then(refresh)}
                />
              </li>
              <li>
                <ConfirmAction
                  triggerLabel="Check in"
                  title="Check this guest in?"
                  description={stamp}
                  onConfirm={() => getMockAdapter().checkIn(selected.id).then(refresh)}
                />
              </li>
            </ol>
          ) : null}

          {tab === "gcash" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <ConfirmAction
                triggerLabel="Confirm Payment & Booking"
                title="Confirm payment and booking?"
                description={stamp}
                onConfirm={() => getMockAdapter().confirmAdminBooking(selected.id).then(refresh)}
              />
              <div className="grid gap-2">
                <Label htmlFor="pay-reject">Reject reason</Label>
                <Input
                  id="pay-reject"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
                <ConfirmAction
                  triggerLabel="Reject"
                  title="Reject this payment?"
                  description={stamp}
                  variant="outline"
                  disabled={!reason.trim()}
                  onConfirm={() =>
                    getMockAdapter().rejectAdminBooking(selected.id, reason).then(refresh)
                  }
                />
              </div>
            </div>
          ) : null}

          {tab === "refunds" ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Refund money moves outside the app. These controls only record refund status.
              </p>
              <div className="flex flex-wrap gap-2">
                <ConfirmAction
                  triggerLabel="Mark Refund Pending"
                  title="Mark refund pending?"
                  description={stamp}
                  onConfirm={() => getMockAdapter().markRefundPending(selected.id).then(refresh)}
                />
                <ConfirmAction
                  triggerLabel="Mark Refunded"
                  title="Mark refunded?"
                  description={stamp}
                  onConfirm={() => getMockAdapter().markRefunded(selected.id).then(refresh)}
                />
              </div>
            </div>
          ) : null}
        </aside>
      ) : null}
    </section>
  );
}
