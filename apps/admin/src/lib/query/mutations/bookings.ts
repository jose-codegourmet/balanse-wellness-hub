"use client";

import { confirmAdminBooking, rejectAdminBooking } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingPaymentDashboardKeys, invalidateForRole, useAdminAuthScope } from "./shared";

export function useConfirmAdminBooking() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmAdminBooking(apiFetchBrowser, id),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboardKeys(role)),
  });
}

export function useRejectAdminBooking() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectAdminBooking(apiFetchBrowser, id, reason),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboardKeys(role)),
  });
}
