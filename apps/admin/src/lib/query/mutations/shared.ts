"use client";

import type { QueryKey, useQueryClient } from "@tanstack/react-query";
import { useStaffSession } from "@/modules/session/SessionProvider";
import { type AdminAuthScope, adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

export function useAdminAuthScope(): AdminAuthScope {
  const { actor } = useStaffSession();
  return adminAuthScope(actor);
}

export function invalidateForRole(
  queryClient: ReturnType<typeof useQueryClient>,
  keys: QueryKey[],
) {
  return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

/** Booking confirm/reject and cash/refund mutations all touch these. */
export function bookingPaymentDashboardKeys(role: AdminAuthScope): QueryKey[] {
  return [
    adminKeys.bookings.all(role),
    adminKeys.payments.all(role),
    adminKeys.dashboard(role),
    adminKeys.queues.all(role),
    adminKeys.bundles.metrics(role),
  ];
}
