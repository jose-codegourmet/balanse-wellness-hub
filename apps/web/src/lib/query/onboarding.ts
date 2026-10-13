import { type ApiFetcher, getMyOnboarding } from "@balanse/api-client";
import { queryOptions } from "@tanstack/react-query";
import { webKeys } from "./keys";
export const myOnboardingQuery = (customerId: string | null, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.me.onboarding(customerId),
    queryFn: () => getMyOnboarding(fetcher),
  });
