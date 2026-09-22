import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassesQuery, adminCoachesQuery, adminSessionsQuery } from "@/lib/query/queries";
import { SessionFormPage } from "../../../schedule/_components/session-form-page/SessionFormPage";

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminClassesQuery(principal), adminCoachesQuery(principal), adminSessionsQuery(principal)],
    <SessionFormPage sessionId={sessionId} surface="overlay" />,
  );
}
