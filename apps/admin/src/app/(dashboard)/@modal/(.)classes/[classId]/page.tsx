import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassesQuery, adminCoachesQuery } from "@/lib/query/queries";
import { ClassFormPage } from "@/modules/admin/classes/ClassFormPage";

export default async function Page({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminClassesQuery(principal.role), adminCoachesQuery(principal.role)],
    <ClassFormPage classId={classId} surface="overlay" />,
  );
}
