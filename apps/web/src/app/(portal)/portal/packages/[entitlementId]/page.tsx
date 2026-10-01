import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentCustomer } from "@/modules/session/current-customer";
import { EntitlementDetailPage } from "../_components/entitlement-detail-page/EntitlementDetailPage";

export const metadata: Metadata = {
  title: "Package detail",
  description: "Owned package sessions remaining and history.",
};

export default async function Page({ params }: { params: Promise<{ entitlementId: string }> }) {
  const { entitlementId } = await params;
  const profile = await getCurrentCustomer();
  if (!profile) notFound();
  const adapter = getMockAdapter();
  const [entitlement, redemptions] = await Promise.all([
    adapter.getMyEntitlement(profile.id, entitlementId),
    adapter.getEntitlementRedemptions(profile.id, entitlementId),
  ]);
  if (!entitlement) notFound();
  return <EntitlementDetailPage entitlement={entitlement} redemptions={redemptions} />;
}
