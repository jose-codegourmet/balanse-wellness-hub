import { isManilaYmd } from "@balanse/domain";
import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassesQuery, adminCoachesQuery, adminSessionsQuery } from "@/lib/query/queries";
import { SessionFormPage } from "../../../schedule/_components/session-form-page/SessionFormPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminClassesQuery(principal), adminCoachesQuery(principal), adminSessionsQuery(principal)],
    <SessionFormPage
      sessionId="new"
      date={isManilaYmd(date) ? date : undefined}
      surface="overlay"
    />,
  );
}
