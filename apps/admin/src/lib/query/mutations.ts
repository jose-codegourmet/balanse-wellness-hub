"use client";

import type { AdminSettings } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import type { MockRole } from "@balanse/mock/session";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { adminKeys } from "./keys";

function useAdminRole() {
  return useMockPrincipal().principal.role;
}

function invalidateForRole(queryClient: ReturnType<typeof useQueryClient>, keys: QueryKey[]) {
  return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

function bookingPaymentDashboard(role: MockRole): QueryKey[] {
  return [
    adminKeys.bookings.all(role),
    adminKeys.payments.all(role),
    adminKeys.dashboard(role),
    adminKeys.queues.all(role),
  ];
}

export function useConfirmAdminBooking() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().confirmAdminBooking(id),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboard(role)),
  });
}

export function useRejectAdminBooking() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      getMockAdapter().rejectAdminBooking(id, reason),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboard(role)),
  });
}

export function useRecordCash() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().recordCash(bookingId),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboard(role)),
  });
}

export function useMarkRefundPending() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().markRefundPending(bookingId),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboard(role)),
  });
}

export function useMarkRefunded() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().markRefunded(bookingId),
    onSuccess: () => invalidateForRole(queryClient, bookingPaymentDashboard(role)),
  });
}

function cancellationKeys(role: MockRole): QueryKey[] {
  return [
    adminKeys.cancellations.all(role),
    adminKeys.bookings.all(role),
    adminKeys.dashboard(role),
    adminKeys.queues.all(role),
  ];
}

export function useCompleteAdminCancellation() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().completeAdminCancellation(bookingId),
    onSuccess: () => invalidateForRole(queryClient, cancellationKeys(role)),
  });
}

export function useRejectAdminCancellation() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      getMockAdapter().rejectAdminCancellation(bookingId, reason),
    onSuccess: () => invalidateForRole(queryClient, cancellationKeys(role)),
  });
}

function rescheduleKeys(role: MockRole): QueryKey[] {
  return [
    adminKeys.reschedules.all(role),
    adminKeys.bookings.all(role),
    adminKeys.sessions.all(role),
    adminKeys.dashboard(role),
    adminKeys.queues.all(role),
  ];
}

export function useApproveAdminReschedule() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().approveAdminReschedule(bookingId),
    onSuccess: () => invalidateForRole(queryClient, rescheduleKeys(role)),
  });
}

export function useRejectAdminReschedule() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      getMockAdapter().rejectAdminReschedule(bookingId, reason),
    onSuccess: () => invalidateForRole(queryClient, rescheduleKeys(role)),
  });
}

function attendanceKeys(role: MockRole): QueryKey[] {
  return [
    adminKeys.bookings.all(role),
    adminKeys.rosterAll(role),
    adminKeys.dashboard(role),
    adminKeys.reports.all(role),
    adminKeys.queues.all(role),
  ];
}

export function useCheckIn() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().checkIn(bookingId),
    onSuccess: () => invalidateForRole(queryClient, attendanceKeys(role)),
  });
}

export function useMarkNoShow() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => getMockAdapter().markNoShow(bookingId),
    onSuccess: () => invalidateForRole(queryClient, attendanceKeys(role)),
  });
}

export function useUpsertAdminClass() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertAdminClass"]>[0]) =>
      getMockAdapter().upsertAdminClass(input),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.classes.all(role)]),
  });
}

export function useUpsertAdminCoach() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertAdminCoach"]>[0]) =>
      getMockAdapter().upsertAdminCoach(input),
    onSuccess: () =>
      invalidateForRole(queryClient, [adminKeys.coaches.all(role), adminKeys.staff.all(role)]),
  });
}

function sessionKeys(role: MockRole): QueryKey[] {
  return [
    adminKeys.sessions.all(role),
    adminKeys.dashboard(role),
    adminKeys.reports.all(role),
    adminKeys.bookings.all(role),
    adminKeys.rosterAll(role),
  ];
}

export function useUpsertAdminSession() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertAdminSession"]>[0]) =>
      getMockAdapter().upsertAdminSession(input),
    onSuccess: () => invalidateForRole(queryClient, sessionKeys(role)),
  });
}

export function useCancelAdminSession() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().cancelAdminSession(id),
    onSuccess: () => invalidateForRole(queryClient, sessionKeys(role)),
  });
}

function staffCoachKeys(role: MockRole): QueryKey[] {
  return [adminKeys.staff.all(role), adminKeys.coaches.all(role)];
}

export function useUpsertAdminStaff() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertAdminStaff"]>[0]) =>
      getMockAdapter().upsertAdminStaff(input),
    onSuccess: () => invalidateForRole(queryClient, staffCoachKeys(role)),
  });
}

export function useDisableAdminStaff() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().disableAdminStaff(id),
    onSuccess: () => invalidateForRole(queryClient, staffCoachKeys(role)),
  });
}

function paymentQrKeys(role: MockRole): QueryKey[] {
  return [adminKeys.paymentQrs.all(role), adminKeys.settings.all(role)];
}

export function useUpsertPaymentQr() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertPaymentQr"]>[0]) =>
      getMockAdapter().upsertPaymentQr(input),
    onSuccess: () => invalidateForRole(queryClient, paymentQrKeys(role)),
  });
}

export function useActivatePaymentQr() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().activatePaymentQr(id),
    onSuccess: () => invalidateForRole(queryClient, paymentQrKeys(role)),
  });
}

export function useArchivePaymentQr() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().archivePaymentQr(id),
    onSuccess: () => invalidateForRole(queryClient, paymentQrKeys(role)),
  });
}

export function useUpsertPolicyDocument() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getMockAdapter>["upsertPolicyDocument"]>[0]) =>
      getMockAdapter().upsertPolicyDocument(input),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}

export function useDeletePolicyDocument() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getMockAdapter().deletePolicyDocument(id),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}

export function useUpdateAdminSettings() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<AdminSettings>) => getMockAdapter().updateAdminSettings(patch),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}

export function usePromotePolicyVersion() {
  const role = useAdminRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentName, version }: { documentName: string; version: string }) =>
      getMockAdapter().promotePolicyVersion(documentName, version),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}
