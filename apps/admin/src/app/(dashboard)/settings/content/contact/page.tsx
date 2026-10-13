import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSettingsQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { SettingsPage } from "../../_components/settings-page/SettingsPage";

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminSettingsQuery(actor, serverFetcher(token))],
    <AdminQuerySuspense>
      <SettingsPage initialTab="content" contentPage="contact" />
    </AdminQuerySuspense>,
  );
}
