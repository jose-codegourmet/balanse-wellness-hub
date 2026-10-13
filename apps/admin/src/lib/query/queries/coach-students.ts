import { type ApiFetcher, getCoachStudent, listCoachStudents } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

/** Coach-only cohorts; the API derives the coach scope from the bearer token. */
export const coachStudentsQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.coachStudents.all(scope),
    queryFn: async () => (await listCoachStudents(fetcher)).items,
  });
};

export const coachStudentDetailQuery = (
  actor: StaffAuthorizationActor | null,
  customerId: string,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.coachStudents.detail(scope, customerId),
    queryFn: () => getCoachStudent(fetcher, customerId),
  });
};
