import { isManilaYmd } from "@balanse/domain";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import {
  adminClassesQuery,
  adminCoachesQuery,
  adminSessionsQuery,
  adminVenuesQuery,
} from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { SessionFormPage } from "../_components/session-form-page/SessionFormPage";

export const metadata: Metadata = {
  title: "New session",
  description: "Schedule a session.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [
      adminClassesQuery(actor, serverFetcher(token)),
      adminCoachesQuery(actor, serverFetcher(token)),
      adminSessionsQuery(actor, serverFetcher(token)),
      adminVenuesQuery(actor, serverFetcher(token)),
    ],
    <SessionFormPage sessionId="new" date={isManilaYmd(date) ? date : undefined} surface="page" />,
  );
}
