import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import {
  adminClassesQuery,
  adminCoachesQuery,
  adminSessionsQuery,
  adminVenuesQuery,
} from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { SessionFormPage } from "../../../schedule/_components/session-form-page/SessionFormPage";

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminClassesQuery(actor, serverFetcher(token)),
      adminCoachesQuery(actor, serverFetcher(token)),
      adminSessionsQuery(actor, serverFetcher(token)),
      adminVenuesQuery(actor, serverFetcher(token)),
    ],
    <SessionFormPage sessionId={sessionId} surface="overlay" />,
  );
}
