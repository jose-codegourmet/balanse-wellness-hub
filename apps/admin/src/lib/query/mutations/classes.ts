"use client";

import {
  type ApiFetcher,
  confirmClassImage,
  createClass,
  deleteClass,
  mintClassImage,
  patchClass,
  putSignedUpload,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "../keys";
import { invalidateForRole, useAdminAuthScope } from "./shared";

type UpsertClassInput = Parameters<typeof createClass>[1] & { id?: string };

/** `fetcher` defaults to the real browser client; stories pass `mockClassFetcher`. */
export function useUpsertAdminClass(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpsertClassInput) =>
      id
        ? patchClass(fetcher, id, input).then((res) => res.class)
        : createClass(fetcher, input).then((res) => res.class),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.classes.all(role)]),
  });
}

export function useDeleteAdminClass(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClass(fetcher, id),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.classes.all(role)]),
  });
}

/** Mint → signed PUT → confirm. Resolves to the public URL stored on the class. */
export function useUploadAdminClassImage(fetcher: ApiFetcher = apiFetchBrowser) {
  return useMutation({
    mutationFn: async (file: File) => {
      const intent = await mintClassImage(fetcher, file.type);
      if (!intent.upload.signedUrl.startsWith("mock:")) {
        await putSignedUpload(intent.upload.signedUrl, file, file.type);
      }
      const confirmed = await confirmClassImage(fetcher, intent.objectKey);
      return confirmed.url;
    },
  });
}
