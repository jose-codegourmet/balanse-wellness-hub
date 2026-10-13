import type { Metadata } from "next";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import {
  canAccessAdminHref,
  firstImplementedPermittedAdminRoute,
} from "@/lib/authorization/admin-access";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { coachStudentsQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { CoachStudentsPage } from "./_components/coach-students-page/CoachStudentsPage";

export const metadata: Metadata = {
  title: "My Students",
  description: "Students in the signed-in coach's classes.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  if (!canAccessAdminHref(actor, "/students")) {
    return <AccessDenied kind="denied" homeHref={firstImplementedPermittedAdminRoute(actor)} />;
  }
  return prefetchAdmin(
    [coachStudentsQuery(actor, serverFetcher(token))],
    <AdminQuerySuspense>
      <CoachStudentsPage />
    </AdminQuerySuspense>,
  );
}
