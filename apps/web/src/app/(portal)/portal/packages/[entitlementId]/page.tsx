import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerMockPrincipal } from "@/modules/session/server-principal";
import { EntitlementDetailPage } from "../_components/entitlement-detail-page/EntitlementDetailPage";

export const metadata: Metadata = {
  title: "Package detail",
  description: "Owned package sessions remaining and history.",
};

export default async function Page({ params }: { params: Promise<{ entitlementId: string }> }) {
  const { entitlementId } = await params;
  const principal = await getServerMockPrincipal();
  const adapter = getMockAdapter();
  const [entitlement, redemptions] = await Promise.all([
    adapter.getMyEntitlement(principal.customerId, entitlementId),
    adapter.getEntitlementRedemptions(principal.customerId, entitlementId),
  ]);
  if (!entitlement) notFound();
  return <EntitlementDetailPage entitlement={entitlement} redemptions={redemptions} />;
}
