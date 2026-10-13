import type { Metadata } from "next";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import {
  canAccessAdminHref,
  firstImplementedPermittedAdminRoute,
} from "@/lib/authorization/admin-access";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { coachStudentDetailQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { CoachStudentDetailPage } from "../_components/coach-student-detail-page/CoachStudentDetailPage";

export const metadata: Metadata = {
  title: "Student",
  description: "A student's activity in the signed-in coach's classes.",
};

export default async function Page({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  if (!canAccessAdminHref(actor, `/students/${customerId}`)) {
    return <AccessDenied kind="denied" homeHref={firstImplementedPermittedAdminRoute(actor)} />;
  }
  return prefetchAdmin(
    [coachStudentDetailQuery(actor, customerId, serverFetcher(token))],
    <AdminQuerySuspense>
      <CoachStudentDetailPage customerId={customerId} />
    </AdminQuerySuspense>,
  );
}
