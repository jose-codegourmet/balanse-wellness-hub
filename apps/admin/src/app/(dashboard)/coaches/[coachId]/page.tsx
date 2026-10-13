import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCoachesQuery, adminSessionsQuery, adminStaffQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { CoachFormPage } from "../_components/coach-form-page/CoachFormPage";

export const metadata: Metadata = {
  title: "Coach",
  description: "Coach profile and internal rate.",
};

export default async function Page({ params }: { params: Promise<{ coachId: string }> }) {
  const { coachId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminCoachesQuery(actor, serverFetcher(token)),
      adminSessionsQuery(actor, serverFetcher(token)),
      adminStaffQuery(actor, serverFetcher(token)),
    ],
    <CoachFormPage coachId={coachId} />,
  );
}
