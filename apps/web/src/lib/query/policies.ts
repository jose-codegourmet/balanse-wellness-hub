"use client";

import { acceptPolicies, getFormPolicies } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { CustomerPolicyForm } from "@balanse/domain";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { webKeys } from "./keys";

export const formPoliciesQuery = (form: CustomerPolicyForm) =>
  queryOptions({
    queryKey: [...webKeys.all(null), "policy-forms", form],
    queryFn: () => getFormPolicies(apiFetchBrowser, form).then((response) => response.items),
  });

export function useAcceptPolicies(customerId: string | null) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      form: CustomerPolicyForm;
      policyVersionIds: string[];
      bookingId?: string;
      acquisitionId?: string;
    }) => acceptPolicies(apiFetchBrowser, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: webKeys.me.policyAcceptances(customerId) }),
  });
}
