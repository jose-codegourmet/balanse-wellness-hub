import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSessionsQuery, adminVenuesQuery } from "@/lib/query/queries";
import { VenueListPage } from "./_components/venue-list-page/VenueListPage";

export const metadata: Metadata = {
  title: "Venues",
  description: "Studio branches and off-site partner venues.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminVenuesQuery(principal), adminSessionsQuery(principal)],
    <AdminQuerySuspense>
      <VenueListPage />
    </AdminQuerySuspense>,
  );
}
