import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCoachesQuery, adminSessionsQuery } from "@/lib/query/queries";
import { CoachFormPage } from "@/modules/admin/coaches/CoachFormPage";

export const metadata: Metadata = {
  title: "Coach",
  description: "Coach profile and internal rate.",
};

export default async function Page({ params }: { params: Promise<{ coachId: string }> }) {
  const { coachId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminCoachesQuery(principal.role), adminSessionsQuery(principal.role)],
    <CoachFormPage coachId={coachId} />,
  );
}
