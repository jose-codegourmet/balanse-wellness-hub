import { type ApiFetcher, getAdminCustomer, listAdminCustomers } from "@balanse/api-client";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { type AdminCustomerListFilters, adminKeys } from "../keys";

export const adminCustomersQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher,
  filters?: AdminCustomerListFilters,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.customers.list(scope, filters),
    queryFn: async () => (await listAdminCustomers(fetcher, filters)).items,
  });
};

export const adminCustomerDetailQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher,
  id: string,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.customers.detail(scope, id),
    queryFn: () => getAdminCustomer(fetcher, id),
  });
};
