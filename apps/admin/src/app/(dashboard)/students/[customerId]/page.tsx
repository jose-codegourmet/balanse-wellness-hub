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
import { coachStudentDetailQuery } from "@/lib/query/queries";
import { CoachStudentDetailPage } from "../_components/coach-student-detail-page/CoachStudentDetailPage";

export const metadata: Metadata = {
  title: "Student",
  description: "A student's activity in the signed-in coach's classes.",
};

export default async function Page({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  const actor = resolveMockStaffActor(principal);
  if (!canAccessAdminHref(actor, `/students/${customerId}`)) {
    return <AccessDenied kind="denied" homeHref={firstImplementedPermittedAdminRoute(actor)} />;
  }
  return prefetchAdmin(
    [coachStudentDetailQuery(principal, customerId)],
    <AdminQuerySuspense>
      <CoachStudentDetailPage customerId={customerId} />
    </AdminQuerySuspense>,
  );
}
