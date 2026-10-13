import type { Metadata } from "next";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSessionsQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { DuplicateScheduleForm } from "../_components/duplicate-schedule-form/DuplicateScheduleForm";

export const metadata: Metadata = {
  title: "Duplicate schedule",
  description: "Copy sessions from one date range to another.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminSessionsQuery(actor, serverFetcher(token))],
    <AdminQuerySuspense>
      <DuplicateScheduleForm sourceStart={from} sourceEnd={to} />
    </AdminQuerySuspense>,
  );
}
