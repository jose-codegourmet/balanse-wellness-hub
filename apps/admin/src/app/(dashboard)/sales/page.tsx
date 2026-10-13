import type { Metadata } from "next";
import { Suspense } from "react";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { canAccessAdminHref } from "@/lib/authorization/admin-access";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminReportsQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { SalesPage } from "./_components/sales-page/SalesPage";
import { DEFAULT_SALES_FILTERS } from "./_lib/sales-filters";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Sales",
  description: "Studio sales and refunds overview for Super Admins.",
};

export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  if (!canAccessAdminHref(actor, "/sales")) {
    return <AccessDenied kind="denied" />;
  }
  return prefetchAdmin(
    [adminReportsQuery(actor, DEFAULT_SALES_FILTERS, serverFetcher(token))],
    <Suspense fallback={<Loading />}>
      <SalesPage />
    </Suspense>,
  );
}
