import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassesQuery } from "@/lib/query/queries";
import { ClassListPage } from "@/modules/admin/classes/ClassListPage";

export const metadata: Metadata = {
  title: "Classes",
  description: "Class catalog.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminClassesQuery(principal.role)],
    <AdminQuerySuspense>
      <ClassListPage />
    </AdminQuerySuspense>,
  );
}
