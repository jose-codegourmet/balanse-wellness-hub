"use client";

import { markRefunded, markRefundPending, recordCash } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingPaymentDashboardKeys, invalidateForRole, useAdminAuthScope } from "./shared";

export function useRecordCash() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => recordCash(apiFetchBrowser, paymentId),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboardKeys(role)),
  });
}

export function useMarkRefundPending() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => markRefundPending(apiFetchBrowser, paymentId),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboardKeys(role)),
  });
}

export function useMarkRefunded() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (refundId: string) => markRefunded(apiFetchBrowser, refundId),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboardKeys(role)),
  });
}
