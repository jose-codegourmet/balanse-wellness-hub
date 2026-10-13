"use client";

import { type ApiFetcher, createClass, patchClass } from "@balanse/api-client";
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
