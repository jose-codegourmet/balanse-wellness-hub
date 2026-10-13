"use client";

import { approveReschedule, rejectReschedule } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";
import { invalidateForRole, useAdminAuthScope } from "./shared";

function rescheduleKeys(role: AdminAuthScope): QueryKey[] {
  return [
    adminKeys.reschedules.all(role),
    adminKeys.bookings.all(role),
    adminKeys.sessions.all(role),
    adminKeys.dashboard(role),
    adminKeys.queues.all(role),
    adminKeys.bundles.metrics(role),
  ];
}

export function useApproveAdminReschedule() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveReschedule(apiFetchBrowser, id),
    onSuccess: () => invalidateForRole(queryClient, rescheduleKeys(role)),
  });
}

export function useRejectAdminReschedule() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      rejectReschedule(apiFetchBrowser, bookingId, reason),
    onSuccess: () => invalidateForRole(queryClient, rescheduleKeys(role)),
  });
}
