import {
  type AdminEventFilters,
  type ApiFetcher,
  getAdminEvent,
  getEventForSession,
  listAdminEvents,
} from "@balanse/api-client";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

export const adminEventsQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher,
  filters: AdminEventFilters = {},
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.events.list(scope, filters),
    queryFn: () => listAdminEvents(fetcher, filters).then((response) => response.items),
  });
};

export const adminEventDetailQuery = (
  actor: StaffAuthorizationActor | null,
  id: string,
  fetcher: ApiFetcher,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.events.detail(scope, id),
    queryFn: () => getAdminEvent(fetcher, id).then((response) => response.event),
  });
};

export const adminEventForSessionQuery = (
  actor: StaffAuthorizationActor | null,
  sessionId: string,
  fetcher: ApiFetcher,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.events.forSession(scope, sessionId),
    queryFn: () => getEventForSession(fetcher, sessionId),
  });
};
