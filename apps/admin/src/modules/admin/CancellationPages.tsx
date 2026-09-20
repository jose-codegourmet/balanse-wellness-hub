"use client";

import {
  auditConfirmationCopy,
  formatSessionDate,
  paymentStatusLabel,
  SLOT_LOCKED_UNTIL_CANCEL_NOTE,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { FeedbackState } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ConfirmAction } from "@/components/balanse/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { adminNowIso } from "@/lib/clock";
import { adminCancellationsQuery, adminCustomersQuery } from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function CancellationQueuePage({ empty }: { empty?: boolean }) {
  const { principal } = useMockPrincipal();
  const rowsQuery = useSuspenseQuery(adminCancellationsQuery(principal.role));
  const customersQuery = useSuspenseQuery(adminCustomersQuery(principal.role));
  const rows = empty ? [] : rowsQuery.data;
  const customers = customersQuery.data;
  const stamp = auditConfirmationCopy(
    "This cancellation action",
    "Admin",
    adminNowIso(),
  );

  return (
    <AdminPageShell title="Cancellation Requests">
      <p className="max-w-2xl text-sm text-muted-foreground">{SLOT_LOCKED_UNTIL_CANCEL_NOTE}</p>
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
                      .then(async () => {
                        await rowsQuery.refetch();
                      })
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
                      .then(async () => {
                        await rowsQuery.refetch();
                      })
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
    </AdminPageShell>
  );
}
