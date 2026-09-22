import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBundleAcquisitionsQuery, adminBundlesQuery } from "@/lib/query/queries";
import { BundleListPage } from "./_components/bundle-list-page/BundleListPage";

export const metadata: Metadata = {
  title: "Bundles",
  description: "Session package catalogue.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminBundlesQuery(principal.role), adminBundleAcquisitionsQuery(principal.role)],
    <AdminQuerySuspense>
      <BundleListPage />
    </AdminQuerySuspense>,
  );
}
