"use client";

import { type ApiFetcher, createVenue, patchVenue, type VenueInput } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "../keys";
import { invalidateForRole, useAdminAuthScope } from "./shared";

type UpsertVenueInput = VenueInput & { id?: string };

/** `fetcher` defaults to the real browser client; stories pass a mock fetcher. */
export function useUpsertAdminVenue(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpsertVenueInput) =>
      id
        ? patchVenue(fetcher, id, input).then((res) => res.venue)
        : createVenue(fetcher, input).then((res) => res.venue),
    // Session lists filter by venue, and event snapshots carry the venue name — refresh both.
    onSuccess: () =>
      invalidateForRole(queryClient, [
        adminKeys.venues.all(role),
        adminKeys.sessions.all(role),
        adminKeys.events.all(role),
      ]),
  });
}
