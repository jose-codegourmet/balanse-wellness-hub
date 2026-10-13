"use client";

import {
  type ApiFetcher,
  checkIn as checkInRequest,
  markNoShow as markNoShowRequest,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";
import { invalidateForRole, useAdminAuthScope } from "./shared";

function attendanceKeys(role: AdminAuthScope): QueryKey[] {
  return [
    adminKeys.bookings.all(role),
    adminKeys.rosterAll(role),
    adminKeys.dashboard(role),
    adminKeys.reports.all(role),
    adminKeys.queues.all(role),
    adminKeys.bundles.metrics(role),
  ];
}

/** `sessionId` is bound at the call site (the session the booking belongs to); `fetcher` defaults to the real browser client. */
export function useCheckIn(sessionId: string, fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => checkInRequest(fetcher, sessionId, bookingId),
    onSuccess: () => invalidateForRole(queryClient, attendanceKeys(role)),
  });
}

export function useMarkNoShow(sessionId: string, fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => markNoShowRequest(fetcher, sessionId, bookingId),
    onSuccess: () => invalidateForRole(queryClient, attendanceKeys(role)),
  });
}
