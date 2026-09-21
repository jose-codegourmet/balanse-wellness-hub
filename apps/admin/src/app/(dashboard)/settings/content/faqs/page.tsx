import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSettingsQuery } from "@/lib/query/queries";
import { SettingsPage } from "../../_components/settings-page/SettingsPage";

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminSettingsQuery(principal.role)],
    <AdminQuerySuspense>
      <SettingsPage initialTab="content" contentPage="faqs" />
    </AdminQuerySuspense>,
  );
}
