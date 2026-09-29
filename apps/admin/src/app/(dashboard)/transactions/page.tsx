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
import {
  adminBookingsQuery,
  adminBundleAcquisitionsQuery,
  adminCustomersQuery,
} from "@/lib/query/queries";
import { TransactionsPage } from "./_components/transactions-page/TransactionsPage";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Studio payment and refund history for Super Admins.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  if (!canAccessAdminHref(resolveMockStaffActor(principal), "/transactions")) {
    return <AccessDenied kind="denied" />;
  }
  return prefetchAdmin(
    [
      adminBookingsQuery(principal),
      adminBundleAcquisitionsQuery(principal),
      adminCustomersQuery(principal),
    ],
    <Suspense fallback={<Loading />}>
      <TransactionsPage />
    </Suspense>,
  );
}
