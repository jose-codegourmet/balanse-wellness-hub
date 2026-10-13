"use client";

import {
  type ApiFetcher,
  archiveEvent,
  cancelEvent,
  confirmEventImage,
  createEvent,
  type EventInput,
  mintEventImage,
  patchEvent,
  publishEvent,
  putSignedUpload,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "../keys";
import { invalidateForRole, useAdminAuthScope } from "./shared";

export function useCreateAdminEvent(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EventInput) =>
      createEvent(fetcher, input).then((response) => response.event),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.events.all(role)]),
  });
}

export function useUpdateAdminEvent(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<EventInput> }) =>
      patchEvent(fetcher, id, patch).then((response) => response.event),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.events.all(role)]),
  });
}

export function usePublishAdminEvent(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishEvent(fetcher, id).then((response) => response.event),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.events.all(role)]),
  });
}

export function useCancelAdminEvent(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelEvent(fetcher, id).then((response) => response.event),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.events.all(role)]),
  });
}

export function useArchiveAdminEvent(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveEvent(fetcher, id).then((response) => response.event),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.events.all(role)]),
  });
}

/** Mint → signed PUT → confirm. Event form keeps the returned key in its RHF value. */
export function useUploadAdminEventImage(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, file }: { eventId: string; file: File }) => {
      const intent = await mintEventImage(fetcher, eventId, file.type);
      if (!intent.upload.signedUrl.startsWith("mock:")) {
        await putSignedUpload(intent.upload.signedUrl, file, file.type);
      }
      await confirmEventImage(fetcher, eventId, intent.objectKey);
      return intent.objectKey;
    },
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.events.all(role)]),
  });
}
