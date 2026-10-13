import { getMyPackage, listEntitlementRedemptions } from "@balanse/api-client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetcher } from "@/lib/query/fetcher";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";
import { EntitlementDetailPage } from "../_components/entitlement-detail-page/EntitlementDetailPage";

export const metadata: Metadata = {
  title: "Package detail",
  description: "Owned package sessions remaining and history.",
};

export default async function Page({ params }: { params: Promise<{ entitlementId: string }> }) {
  const { entitlementId } = await params;
  const profile = await getCurrentCustomer();
  if (!profile) notFound();
  const fetcher = serverFetcher(await getCustomerAccessToken());
  const [entitlement, redemptions] = await Promise.all([
    getMyPackage(fetcher, entitlementId)
      .then((result) => result.entitlement)
      .catch(() => null),
    listEntitlementRedemptions(fetcher, entitlementId)
      .then((result) => result.items)
      .catch(() => []),
  ]);
  if (!entitlement) notFound();
  return <EntitlementDetailPage entitlement={entitlement} redemptions={redemptions} />;
}
