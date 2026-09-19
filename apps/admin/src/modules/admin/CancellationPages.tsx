"use client";

import {
  auditConfirmationCopy,
  type CustomerBooking,
  formatSessionDate,
  paymentStatusLabel,
  SLOT_LOCKED_UNTIL_CANCEL_NOTE,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { FeedbackState, LocalizedSkeleton } from "@balanse/ui";
import { useEffect, useState } from "react";
import { ConfirmAction, PageHeader } from "./shared";

export function CancellationQueuePage({ empty }: { empty?: boolean }) {
  const [rows, setRows] = useState<CustomerBooking[] | null>(null);
  const [customers, setCustomers] = useState<{ id: string; fullName: string }[]>([]);
  const stamp = auditConfirmationCopy(
    "This cancellation action",
    "Admin",
    "2026-09-16T02:50:00.000Z",
  );

  useEffect(() => {
    void Promise.all([
      getMockAdapter().getAdminCancellationRequests(),
      getMockAdapter().getAdminCustomers(),
    ]).then(([list, people]) => {
      setRows(empty ? [] : list);
      setCustomers(people);
    });
  }, [empty]);

  if (!rows) return <LocalizedSkeleton lines={6} label="Loading cancellation requests" />;

  return (
    <section>
      <PageHeader title="Cancellation Requests" />
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        {SLOT_LOCKED_UNTIL_CANCEL_NOTE}
      </p>
      {rows.length === 0 ? (
        <FeedbackState id="admin.no-cancellation-requests" className="mt-6" />
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((row) => (
            <li key={row.id} className="rounded-xl border border-border p-4">
              <p>
                <span className="text-muted-foreground">Customer </span>
                {customers.find((person) => person.id === row.customerId)?.fullName ??
                  row.customerId}
              </p>
              <p>
                <span className="text-muted-foreground">Booking </span>
                {row.session.className} · {formatSessionDate(row.session.startsAt)}
              </p>
              <p>
                <span className="text-muted-foreground">Payment status </span>
                {paymentStatusLabel(row.paymentStatus)}
              </p>
              <p>
                <span className="text-muted-foreground">Request time </span>
                {row.requestCreatedAt ? formatSessionDate(row.requestCreatedAt) : "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Reason </span>
                {row.cancellationReason ?? "—"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ConfirmAction
                  triggerLabel="Complete Cancellation"
                  title="Complete cancellation?"
                  description={`${stamp} ${SLOT_LOCKED_UNTIL_CANCEL_NOTE}`}
                  onConfirm={() =>
                    getMockAdapter()
                      .completeAdminCancellation(row.id)
                      .then(async () =>
                        setRows(await getMockAdapter().getAdminCancellationRequests()),
                      )
                  }
                />
                <ConfirmAction
                  triggerLabel="Reject Request"
                  title="Reject cancellation request?"
                  description={stamp}
                  variant="outline"
                  onConfirm={() =>
                    getMockAdapter()
                      .rejectAdminCancellation(row.id, "Request rejected")
                      .then(async () =>
                        setRows(await getMockAdapter().getAdminCancellationRequests()),
                      )
                  }
                />
                <ConfirmAction
                  triggerLabel="Mark Refund Pending"
                  title="Mark refund pending?"
                  description={`${stamp} Refund status is separate from cancellation.`}
                  variant="outline"
                  onConfirm={() => getMockAdapter().markRefundPending(row.id)}
                />
                <ConfirmAction
                  triggerLabel="Mark Refunded"
                  title="Mark refunded?"
                  description={`${stamp} Money moves outside the app.`}
                  variant="outline"
                  onConfirm={() => getMockAdapter().markRefunded(row.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
