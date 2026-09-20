import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassesQuery, adminCoachesQuery } from "@/lib/query/queries";
import { ClassFormPage } from "@/modules/admin/classes/ClassFormPage";

export const metadata: Metadata = {
  title: "Add Class",
  description: "Create a class.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminClassesQuery(principal.role), adminCoachesQuery(principal.role)],
    <ClassFormPage classId="new" surface="page" />,
  );
}
