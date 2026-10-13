"use client";

import {
  markRefunded,
  markRefundPending,
  recordCash,
  rejectPaymentProof,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "../keys";
import { bookingPaymentDashboardKeys, invalidateForRole, useAdminAuthScope } from "./shared";

/** Records cash only. Prefer `useReceiveCashAndConfirm` at the counter. */
export function useRecordCash() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => recordCash(apiFetchBrowser, paymentId),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboardKeys(role)),
  });
}

/** Counter action: record the cash and confirm the booking in one server transaction. */
export function useReceiveCashAndConfirm() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => recordCash(apiFetchBrowser, paymentId, { confirm: true }),
    // Confirming changes session occupancy and rosters, not only payments.
    onSuccess: () =>
      invalidateForRole(queryClient, [
        ...bookingPaymentDashboardKeys(role),
        adminKeys.sessions.all(role),
        adminKeys.rosterAll(role),
      ]),
  });
}

/** GCash queue: reject the receipt only; the booking returns to Payment Needed. */
export function useRejectPaymentProof() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { paymentId: string; reason: string }) =>
      rejectPaymentProof(apiFetchBrowser, input.paymentId, input.reason),
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
