import {
  MOCK_HARNESS_COOKIE,
  parseMockPrincipal,
  resolveMockStaffActor,
} from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import {
  canAccessAdminHref,
  firstImplementedPermittedAdminRoute,
} from "@/lib/authorization/admin-access";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { coachStudentsQuery } from "@/lib/query/queries";
import { CoachStudentsPage } from "./_components/coach-students-page/CoachStudentsPage";

export const metadata: Metadata = {
  title: "My Students",
  description: "Students in the signed-in coach's classes.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  const actor = resolveMockStaffActor(principal);
  if (!canAccessAdminHref(actor, "/students")) {
    return <AccessDenied kind="denied" homeHref={firstImplementedPermittedAdminRoute(actor)} />;
  }
  return prefetchAdmin(
    [coachStudentsQuery(principal)],
    <AdminQuerySuspense>
      <CoachStudentsPage />
    </AdminQuerySuspense>,
  );
}
