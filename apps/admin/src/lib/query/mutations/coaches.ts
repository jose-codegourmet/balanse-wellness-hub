"use client";

import {
  type ApiFetcher,
  type CoachInput,
  confirmCoachPhoto,
  createCoach,
  deleteCoach,
  mintCoachPhoto,
  patchCoach,
  putSignedUpload,
  removeCoachPhoto,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "../keys";
import { invalidateForRole, useAdminAuthScope } from "./shared";

type UpsertCoachInput = CoachInput & { id?: string };

/** `fetcher` defaults to the real browser client; stories pass a mock fetcher. */
export function useUpsertAdminCoach(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpsertCoachInput) =>
      id
        ? patchCoach(fetcher, id, input).then((res) => res.coach)
        : createCoach(fetcher, input).then((res) => res.coach),
    onSuccess: () =>
      invalidateForRole(queryClient, [adminKeys.coaches.all(role), adminKeys.staff.all(role)]),
  });
}

/** Activate / deactivate only; leaves every other field (including rates) untouched. */
export function useSetCoachActive(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      patchCoach(fetcher, id, { active }).then((res) => res.coach),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.coaches.all(role)]),
  });
}

/** Hard delete. The API answers 409 `coach_in_use` when the coach must be deactivated instead. */
export function useDeleteAdminCoach(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCoach(fetcher, id),
    onSuccess: () =>
      invalidateForRole(queryClient, [adminKeys.coaches.all(role), adminKeys.staff.all(role)]),
  });
}

/** Mint → PUT → confirm (BE-052). Only resolves with the new `photoKey` once the server has it. */
export function useReplaceCoachPhoto(coachId: string, fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const intent = await mintCoachPhoto(fetcher, coachId, file.type);
      // Storybook's mock fetcher has no storage to PUT bytes to — it marks the
      // signed URL as such so the mint→confirm cycle still completes end to end.
      if (!intent.upload.signedUrl.startsWith("mock:")) {
        await putSignedUpload(intent.upload.signedUrl, file, file.type);
      }
      return confirmCoachPhoto(fetcher, coachId, intent.objectKey);
    },
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.coaches.all(role)]),
  });
}

export function useRemoveCoachPhoto(coachId: string, fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => removeCoachPhoto(fetcher, coachId),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.coaches.all(role)]),
  });
}
