import { type ApiFetcher, getPaymentInstructions } from "@balanse/api-client";
import { queryOptions } from "@tanstack/react-query";
import { webKeys } from "./keys";
export const paymentInstructionsQuery = (customerId: string, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: [...webKeys.all(customerId), "payment-instructions"],
    queryFn: () => getPaymentInstructions(fetcher),
  });
