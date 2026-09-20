import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCoachesQuery } from "@/lib/query/queries";
import { CoachListPage } from "@/modules/admin/coaches/CoachListPage";

export const metadata: Metadata = {
  title: "Coaches",
  description: "Coach management.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminCoachesQuery(principal.role)],
    <AdminQuerySuspense>
      <CoachListPage />
    </AdminQuerySuspense>,
  );
}
