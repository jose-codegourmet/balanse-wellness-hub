import {
  MOCK_HARNESS_COOKIE,
  parseMockPrincipal,
  resolveMockStaffActor,
} from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import {
  canAccessAdminHref,
  firstImplementedPermittedAdminRoute,
} from "@/lib/authorization/admin-access";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminMarketingInsightsQuery } from "@/lib/query/queries";
import { MarketingInsightsPage } from "./_components/marketing-insights-page/MarketingInsightsPage";
import { defaultMarketingInsightsRange } from "./_lib/marketing-insights-range";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Marketing insights",
  description: "Aggregate sign-up, onboarding, and sharing insights for Super Admins.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  const actor = resolveMockStaffActor(principal);
  if (!canAccessAdminHref(actor, "/marketing-insights")) {
    return <AccessDenied kind="denied" homeHref={firstImplementedPermittedAdminRoute(actor)} />;
  }
  return prefetchAdmin(
    [adminMarketingInsightsQuery(principal, defaultMarketingInsightsRange())],
    <Suspense fallback={<Loading />}>
      <MarketingInsightsPage />
    </Suspense>,
  );
}
