"use client";

import {
  type ApiFetcher,
  cancelSession,
  createRecurrence,
  createSession,
  duplicateSessions,
  patchSession,
  type SessionInput,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { DuplicateScheduleInput, RecurringScheduleInput } from "@balanse/domain";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";
import { invalidateForRole, useAdminAuthScope } from "./shared";

function sessionKeys(role: AdminAuthScope): QueryKey[] {
  return [
    adminKeys.sessions.all(role),
    adminKeys.events.all(role),
    adminKeys.dashboard(role),
    adminKeys.reports.all(role),
    adminKeys.bookings.all(role),
    adminKeys.rosterAll(role),
  ];
}

type UpsertSessionInput = SessionInput & { id?: string };

/** `fetcher` defaults to the real browser client; stories pass a mock fetcher. */
export function useUpsertAdminSession(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpsertSessionInput) =>
      id
        ? patchSession(fetcher, id, input).then((res) => res.session)
        : createSession(fetcher, input).then((res) => res.session),
    onSuccess: () => invalidateForRole(queryClient, sessionKeys(role)),
  });
}

export function useDuplicateAdminSchedule(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DuplicateScheduleInput) => duplicateSessions(fetcher, input),
    onSuccess: () => invalidateForRole(queryClient, sessionKeys(role)),
  });
}

export function useCreateAdminRecurringSchedule(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceSessionId, ...input }: RecurringScheduleInput) =>
      createRecurrence(fetcher, sourceSessionId, input),
    onSuccess: () => invalidateForRole(queryClient, sessionKeys(role)),
  });
}

export function useCancelAdminSession(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelSession(fetcher, id),
    onSuccess: () => invalidateForRole(queryClient, sessionKeys(role)),
  });
}

/** Guarded time-only update; never re-submit coach/rate/capacity snapshots. */
export function useMoveAdminSession(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      startsAt: string;
      endsAt: string;
      expectedStartsAt: string;
      expectedEndsAt: string;
    }) => patchSession(fetcher, id, input).then((res) => res.session),
    onSuccess: () => invalidateForRole(queryClient, sessionKeys(role)),
  });
}
