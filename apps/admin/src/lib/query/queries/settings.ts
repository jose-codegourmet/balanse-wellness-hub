import type { ApiFetcher } from "@balanse/api-client";
import { getAdminSettings, listPaymentAccounts } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { StaffAuthorizationActor } from "@balanse/domain";
import { queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";

export const adminSettingsQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.settings.all(scope),
    queryFn: () => getAdminSettings(fetcher),
  });
};

/** Payment accounts (GCash/Maya/QR Ph) via `/api/admin/settings/payment-qrs` (WIRE-1704, #371). */
export const adminPaymentQrsQuery = (
  actor: StaffAuthorizationActor | null,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.paymentQrs.all(scope),
    queryFn: () => listPaymentAccounts(fetcher),
  });
};
