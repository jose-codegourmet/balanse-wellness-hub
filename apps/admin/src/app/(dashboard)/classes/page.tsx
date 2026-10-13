import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassesQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { ClassListPage } from "./_components/class-list-page/ClassListPage";
export const metadata = { title: "Classes" };
export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminClassesQuery(actor, serverFetcher(token))],
    <AdminQuerySuspense>
      <ClassListPage />
    </AdminQuerySuspense>,
  );
}
