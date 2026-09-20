"use client";

import {
  auditConfirmationCopy,
  canApproveReschedule,
  computeSessionInventory,
  formatSessionRange,
  RESCHEDULE_HISTORY_NOTE,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { FeedbackState } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ConfirmAction } from "@/components/balanse/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { adminNowIso } from "@/lib/clock";
import {
  adminBookingsQuery,
  adminCustomersQuery,
  adminReschedulesQuery,
} from "@/lib/query/queries";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function RescheduleQueuePage({ empty }: { empty?: boolean }) {
  const { principal } = useMockPrincipal();
  const rowsQuery = useSuspenseQuery(adminReschedulesQuery(principal.role));
  const customersQuery = useSuspenseQuery(adminCustomersQuery(principal.role));
  const bookingsQuery = useSuspenseQuery(adminBookingsQuery(principal.role));
  const rows = empty ? [] : rowsQuery.data;
  const customers = customersQuery.data;
  const bookings = bookingsQuery.data;
  const [message, setMessage] = useState<string | null>(null);
  const stamp = auditConfirmationCopy("This reschedule action", "Admin", adminNowIso());

  return (
    <AdminPageShell title="Reschedule Requests">
      <p className="max-w-2xl text-sm text-muted-foreground">{RESCHEDULE_HISTORY_NOTE}</p>
      {message ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {message}
        </p>
      ) : null}
      {rows.length === 0 ? (
        <FeedbackState id="admin.no-reschedule-requests" className="mt-6" />
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((row) => {
            const target = row.targetSession;
            const inventory = target
              ? computeSessionInventory(
                  target,
                  bookings.filter((booking) => booking.sessionId === target.id),
                )
              : null;
            return (
              <li
                key={row.id}
                className="grid gap-4 rounded-xl border border-border p-4 md:grid-cols-2"
              >
                <div>
                  <h2 className="font-display text-xl">Current Booking</h2>
                  <p className="mt-2 text-sm">
                    {customers.find((person) => person.id === row.customerId)?.fullName}
                  </p>
                  <p className="text-sm">
                    {row.session.className} ·{" "}
                    {formatSessionRange(row.session.startsAt, row.session.endsAt)}
                  </p>
                  <p className="text-sm">{row.session.coachName}</p>
                </div>
                <div>
                  <h2 className="font-display text-xl">Requested Session</h2>
                  {target ? (
                    <>
                      <p className="mt-2 text-sm">
                        {target.className} · {formatSessionRange(target.startsAt, target.endsAt)}
                      </p>
                      <p className="text-sm">
                        Target coach {target.coachName} · capacity {target.capacity} · available{" "}
                        {inventory?.available ?? target.remainingSlots}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm">No target session recorded.</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 md:col-span-2">
                  <ConfirmAction
                    triggerLabel="Approve & Move"
                    title="Approve and move this booking?"
                    description={`${stamp} ${RESCHEDULE_HISTORY_NOTE}`}
                    onConfirm={async () => {
                      if (target) {
                        const allowed = canApproveReschedule(target);
                        if (!allowed.ok) {
                          setMessage(allowed.error);
                          return;
                        }
                      }
                      try {
                        await getMockAdapter().approveAdminReschedule(row.id);
                        await rowsQuery.refetch();
                        setMessage(null);
                      } catch (error) {
                        setMessage(error instanceof Error ? error.message : "Could not approve.");
                      }
                    }}
                  />
                  <ConfirmAction
                    triggerLabel="Reject"
                    title="Reject this reschedule request?"
                    description={stamp}
                    variant="outline"
                    onConfirm={() =>
                      getMockAdapter()
                        .rejectAdminReschedule(row.id, "Request rejected")
                        .then(async () => {
                          await rowsQuery.refetch();
                        })
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminPageShell>
  );
}
