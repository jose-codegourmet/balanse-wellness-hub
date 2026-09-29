import {
  MOCK_HARNESS_COOKIE,
  parseMockPrincipal,
  resolveMockStaffActor,
} from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { canAccessAdminHref } from "@/lib/authorization/admin-access";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminReportsQuery } from "@/lib/query/queries";
import { SalesPage } from "./_components/sales-page/SalesPage";
import { DEFAULT_SALES_FILTERS } from "./_lib/sales-filters";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Sales",
  description: "Studio sales and refunds overview for Super Admins.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  if (!canAccessAdminHref(resolveMockStaffActor(principal), "/sales")) {
    return <AccessDenied kind="denied" />;
  }
  return prefetchAdmin(
    [adminReportsQuery(principal, DEFAULT_SALES_FILTERS)],
    <Suspense fallback={<Loading />}>
      <SalesPage />
    </Suspense>,
  );
}
