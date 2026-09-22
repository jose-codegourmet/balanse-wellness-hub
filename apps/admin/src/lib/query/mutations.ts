"use client";

import type { AdminSettings } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { type AdminAuthScope, adminAuthScope, bindAdminQueryPrincipal } from "./auth-scope";
import { adminKeys } from "./keys";

function useAdminAuthScope(): AdminAuthScope {
  const { principal } = useMockPrincipal();
  bindAdminQueryPrincipal(principal);
  return adminAuthScope(principal);
}

function invalidateForRole(queryClient: ReturnType<typeof useQueryClient>, keys: QueryKey[]) {
  return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

function bookingPaymentDashboard(role: AdminAuthScope): QueryKey[] {
  return [
    adminKeys.bookings.all(role),
    adminKeys.payments.all(role),
    adminKeys.dashboard(role),
    adminKeys.queues.all(role),
  ];
}

export function useConfirmAdminBooking() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().confirmAdminBooking(id),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboard(role)),
  });
}

export function useRejectAdminBooking() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      getMockAdapter().rejectAdminBooking(id, reason),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboard(role)),
  });
}

export function useRecordCash() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().recordCash(bookingId),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboard(role)),
  });
}

export function useMarkRefundPending() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().markRefundPending(bookingId),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboard(role)),
  });
}

export function useMarkRefunded() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().markRefunded(bookingId),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboard(role)),
  });
}

function cancellationKeys(role: AdminAuthScope): QueryKey[] {
  return [
    adminKeys.cancellations.all(role),
    adminKeys.bookings.all(role),
    adminKeys.dashboard(role),
    adminKeys.queues.all(role),
  ];
}

export function useCompleteAdminCancellation() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().completeAdminCancellation(bookingId),
    onSuccess: () => invalidateForRole(queryClient, cancellationKeys(role)),
  });
}

export function useRejectAdminCancellation() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      getMockAdapter().rejectAdminCancellation(bookingId, reason),
    onSuccess: () => invalidateForRole(queryClient, cancellationKeys(role)),
  });
}

function rescheduleKeys(role: AdminAuthScope): QueryKey[] {
  return [
    adminKeys.reschedules.all(role),
    adminKeys.bookings.all(role),
    adminKeys.sessions.all(role),
    adminKeys.dashboard(role),
    adminKeys.queues.all(role),
  ];
}

export function useApproveAdminReschedule() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().approveAdminReschedule(bookingId),
    onSuccess: () => invalidateForRole(queryClient, rescheduleKeys(role)),
  });
}

export function useRejectAdminReschedule() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      getMockAdapter().rejectAdminReschedule(bookingId, reason),
    onSuccess: () => invalidateForRole(queryClient, rescheduleKeys(role)),
  });
}

function attendanceKeys(role: AdminAuthScope): QueryKey[] {
  return [
    adminKeys.bookings.all(role),
    adminKeys.rosterAll(role),
    adminKeys.dashboard(role),
    adminKeys.reports.all(role),
    adminKeys.queues.all(role),
  ];
}

export function useCheckIn() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().checkIn(bookingId),
    onSuccess: () => invalidateForRole(queryClient, attendanceKeys(role)),
  });
}

export function useMarkNoShow() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().markNoShow(bookingId),
    onSuccess: () => invalidateForRole(queryClient, attendanceKeys(role)),
  });
}

export function useUpsertAdminClass() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertAdminClass"]>[0]) =>
      getMockAdapter().upsertAdminClass(input),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.classes.all(role)]),
  });
}

export function useUpsertAdminCoach() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertAdminCoach"]>[0]) =>
      getMockAdapter().upsertAdminCoach(input),
    onSuccess: () =>
      invalidateForRole(queryClient, [adminKeys.coaches.all(role), adminKeys.staff.all(role)]),
  });
}

function sessionKeys(role: AdminAuthScope): QueryKey[] {
  return [
    adminKeys.sessions.all(role),
    adminKeys.dashboard(role),
    adminKeys.reports.all(role),
    adminKeys.bookings.all(role),
    adminKeys.rosterAll(role),
  ];
}

export function useUpsertAdminSession() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertAdminSession"]>[0]) =>
      getMockAdapter().upsertAdminSession(input),
    onSuccess: () => invalidateForRole(queryClient, sessionKeys(role)),
  });
}

export function useDuplicateAdminSchedule() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      input: Parameters<ReturnType<typeof getMockAdapter>["duplicateAdminSchedule"]>[0],
    ) => getMockAdapter().duplicateAdminSchedule(input),
    onSuccess: () => invalidateForRole(queryClient, sessionKeys(role)),
  });
}

export function useCreateAdminRecurringSchedule() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      input: Parameters<ReturnType<typeof getMockAdapter>["createAdminRecurringSchedule"]>[0],
    ) => getMockAdapter().createAdminRecurringSchedule(input),
    onSuccess: () => invalidateForRole(queryClient, sessionKeys(role)),
  });
}

export function useCancelAdminSession() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().cancelAdminSession(id),
    onSuccess: () => invalidateForRole(queryClient, sessionKeys(role)),
  });
}

function staffCoachKeys(role: AdminAuthScope): QueryKey[] {
  return [adminKeys.staff.all(role), adminKeys.coaches.all(role)];
}

export function useUpsertAdminStaff() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertAdminStaff"]>[0]) =>
      getMockAdapter().upsertAdminStaff(input),
    onSuccess: () => invalidateForRole(queryClient, staffCoachKeys(role)),
  });
}

export function useDisableAdminStaff() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().disableAdminStaff(id),
    onSuccess: () => invalidateForRole(queryClient, staffCoachKeys(role)),
  });
}

function paymentQrKeys(role: AdminAuthScope): QueryKey[] {
  return [adminKeys.paymentQrs.all(role), adminKeys.settings.all(role)];
}

export function useUpsertPaymentQr() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertPaymentQr"]>[0]) =>
      getMockAdapter().upsertPaymentQr(input),
    onSuccess: () => invalidateForRole(queryClient, paymentQrKeys(role)),
  });
}

export function useActivatePaymentQr() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().activatePaymentQr(id),
    onSuccess: () => invalidateForRole(queryClient, paymentQrKeys(role)),
  });
}

export function useArchivePaymentQr() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().archivePaymentQr(id),
    onSuccess: () => invalidateForRole(queryClient, paymentQrKeys(role)),
  });
}

export function useUpsertPolicyDocument() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertPolicyDocument"]>[0]) =>
      getMockAdapter().upsertPolicyDocument(input),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}

export function useDeletePolicyDocument() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().deletePolicyDocument(id),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}

export function useUpdateAdminSettings() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<AdminSettings>) => getMockAdapter().updateAdminSettings(patch),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}

function bundleKeys(role: AdminAuthScope): QueryKey[] {
  return [adminKeys.bundles.all(role), adminKeys.customers.all(role)];
}

export function useUpsertAdminBundle() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertAdminBundle"]>[0]) =>
      getMockAdapter().upsertAdminBundle(input),
    onSuccess: () => invalidateForRole(queryClient, bundleKeys(role)),
  });
}

export function useSetAdminBundleStatus() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Parameters<ReturnType<typeof getMockAdapter>["setAdminBundleStatus"]>[1];
    }) => getMockAdapter().setAdminBundleStatus(id, status),
    onSuccess: () => invalidateForRole(queryClient, bundleKeys(role)),
  });
}

export function useGrantCustomerBundle() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["grantCustomerBundle"]>[0]) =>
      getMockAdapter().grantCustomerBundle(input),
    onSuccess: () => invalidateForRole(queryClient, bundleKeys(role)),
  });
}

export function useRevokeCustomerEntitlement() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      input: Parameters<ReturnType<typeof getMockAdapter>["revokeCustomerEntitlement"]>[0],
    ) => getMockAdapter().revokeCustomerEntitlement(input),
    onSuccess: () => invalidateForRole(queryClient, bundleKeys(role)),
  });
}

export function useApproveBundleAcquisition() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().approveBundleAcquisition(id),
    onSuccess: () => invalidateForRole(queryClient, bundleKeys(role)),
  });
}

export function useRejectBundleAcquisition() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      getMockAdapter().rejectBundleAcquisition(id, reason),
    onSuccess: () => invalidateForRole(queryClient, bundleKeys(role)),
  });
}

export function usePromotePolicyVersion() {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentName, version }: { documentName: string; version: string }) =>
      getMockAdapter().promotePolicyVersion(documentName, version),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}
