"use client";

import {
  type ApiFetcher,
  approveAdminClassChangeRequest,
  createAdminClassChangeRequest,
  denyAdminClassChangeRequest,
  withdrawAdminClassChangeRequest,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { CreateClassChangeRequestInput } from "@balanse/domain";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";
import { invalidateForRole, useAdminAuthScope } from "./shared";

function classChangeKeys(scope: AdminAuthScope): QueryKey[] {
  return [
    adminKeys.classChanges.all(scope),
    adminKeys.sessions.all(scope),
    adminKeys.bookings.all(scope),
    adminKeys.rosterAll(scope),
    adminKeys.dashboard(scope),
    adminKeys.reports.all(scope),
    adminKeys.events.all(scope),
  ];
}

export function useCreateClassChangeRequest(fetcher: ApiFetcher = apiFetchBrowser) {
  const scope = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClassChangeRequestInput) =>
      createAdminClassChangeRequest(fetcher, input).then((response) => response.request),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.classChanges.all(scope)]),
  });
}

export function useWithdrawClassChangeRequest(fetcher: ApiFetcher = apiFetchBrowser) {
  const scope = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      withdrawAdminClassChangeRequest(fetcher, id).then((response) => response.request),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.classChanges.all(scope)]),
  });
}

export function useApproveClassChangeRequest(fetcher: ApiFetcher = apiFetchBrowser) {
  const scope = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; note?: string | null }) =>
      approveAdminClassChangeRequest(fetcher, input.id, input.note).then(
        (response) => response.request,
      ),
    onSuccess: () => invalidateForRole(queryClient, classChangeKeys(scope)),
  });
}

export function useDenyClassChangeRequest(fetcher: ApiFetcher = apiFetchBrowser) {
  const scope = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; note: string }) =>
      denyAdminClassChangeRequest(fetcher, input.id, input.note).then(
        (response) => response.request,
      ),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.classChanges.all(scope)]),
  });
}
