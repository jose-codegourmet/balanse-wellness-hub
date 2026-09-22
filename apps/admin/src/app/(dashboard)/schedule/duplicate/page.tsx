import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSessionsQuery } from "@/lib/query/queries";
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
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminSessionsQuery(principal.role)],
    <AdminQuerySuspense>
      <DuplicateScheduleForm sourceStart={from} sourceEnd={to} />
    </AdminQuerySuspense>,
  );
}
