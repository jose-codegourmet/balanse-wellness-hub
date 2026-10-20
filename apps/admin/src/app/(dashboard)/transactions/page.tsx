import { isTransactionsTab, type TransactionsTab } from "@balanse/domain";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { canAccessAdminHref } from "@/lib/authorization/admin-access";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminTransactionsInfiniteQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { TransactionsPage } from "./_components/transactions-page/TransactionsPage";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Studio payment and refund history for Super Admins.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const [{ actor }, token, params] = await Promise.all([
    getStaffSession(),
    getStaffAccessToken(),
    searchParams,
  ]);
  if (!canAccessAdminHref(actor, "/transactions")) {
    return <AccessDenied kind="denied" />;
  }
  const requested = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const tab: TransactionsTab = isTransactionsTab(requested) ? requested : "all";
  return prefetchAdmin(
    [adminTransactionsInfiniteQuery(actor, { tab }, serverFetcher(token))],
    <Suspense fallback={<Loading />}>
      <TransactionsPage />
    </Suspense>,
  );
}
