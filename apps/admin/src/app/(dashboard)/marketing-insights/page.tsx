import type { Metadata } from "next";
import { Suspense } from "react";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import {
  canAccessAdminHref,
  firstImplementedPermittedAdminRoute,
} from "@/lib/authorization/admin-access";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminMarketingInsightsQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { MarketingInsightsPage } from "./_components/marketing-insights-page/MarketingInsightsPage";
import { defaultMarketingInsightsRange } from "./_lib/marketing-insights-range";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Marketing insights",
  description: "Aggregate sign-up, onboarding, and sharing insights for Super Admins.",
};

export default async function Page() {
  const { actor } = await getStaffSession();
  if (!canAccessAdminHref(actor, "/marketing-insights")) {
    return <AccessDenied kind="denied" homeHref={firstImplementedPermittedAdminRoute(actor)} />;
  }
  return prefetchAdmin(
    [
      adminMarketingInsightsQuery(
        actor,
        defaultMarketingInsightsRange(),
        serverFetcher(await getStaffAccessToken()),
      ),
    ],
    <Suspense fallback={<Loading />}>
      <MarketingInsightsPage />
    </Suspense>,
  );
}
