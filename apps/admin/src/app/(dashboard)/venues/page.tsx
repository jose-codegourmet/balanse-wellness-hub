import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSessionsQuery, adminVenuesQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { VenueListPage } from "./_components/venue-list-page/VenueListPage";

export const metadata: Metadata = {
  title: "Venues",
  description: "Studio branches and off-site partner venues.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminVenuesQuery(actor, serverFetcher(token)),
      adminSessionsQuery(actor, serverFetcher(token)),
    ],
    <AdminQuerySuspense>
      <VenueListPage />
    </AdminQuerySuspense>,
  );
}
