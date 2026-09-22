import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCoachesQuery, adminSessionsQuery, adminStaffQuery } from "@/lib/query/queries";
import { CoachFormPage } from "../_components/coach-form-page/CoachFormPage";

export const metadata: Metadata = {
  title: "Coach",
  description: "Coach profile and internal rate.",
};

export default async function Page({ params }: { params: Promise<{ coachId: string }> }) {
  const { coachId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminCoachesQuery(principal), adminSessionsQuery(principal), adminStaffQuery(principal)],
    <CoachFormPage coachId={coachId} />,
  );
}
