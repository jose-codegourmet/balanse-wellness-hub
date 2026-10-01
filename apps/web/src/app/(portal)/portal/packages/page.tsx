import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { getCurrentCustomer } from "@/modules/session/current-customer";
import { MyPackagesPage } from "./_components/my-packages-page/MyPackagesPage";

export const metadata: Metadata = {
  title: "Your packages",
  description: "Owned session packages.",
};

export default async function Page() {
  const profile = await getCurrentCustomer();
  const customerId = profile?.id ?? "";
  const adapter = getMockAdapter();
  const [entitlements, acquisitions, catalogue] = await Promise.all([
    adapter.getMyEntitlements(customerId),
    adapter.getMyAcquisitions(customerId),
    adapter.getPublicBundles(),
  ]);
  return (
    <MyPackagesPage entitlements={entitlements} acquisitions={acquisitions} catalogue={catalogue} />
  );
}
