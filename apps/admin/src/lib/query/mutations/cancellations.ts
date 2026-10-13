"use client";

import { completeCancellation, rejectCancellation } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";
import { invalidateForRole, useAdminAuthScope } from "./shared";

function cancellationKeys(role: AdminAuthScope): QueryKey[] {
  return [
    adminKeys.cancellations.all(role),
    adminKeys.bookings.all(role),
    adminKeys.dashboard(role),
    adminKeys.queues.all(role),
    adminKeys.bundles.metrics(role),
  ];
}

export function useCompleteAdminCancellation() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeCancellation(apiFetchBrowser, id),
    onSuccess: () => invalidateForRole(queryClient, cancellationKeys(role)),
  });
}

export function useRejectAdminCancellation() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      rejectCancellation(apiFetchBrowser, bookingId, reason),
    onSuccess: () => invalidateForRole(queryClient, cancellationKeys(role)),
  });
}
