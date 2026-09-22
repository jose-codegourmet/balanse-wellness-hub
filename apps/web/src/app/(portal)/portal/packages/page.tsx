import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { getServerMockPrincipal } from "@/modules/session/server-principal";
import { MyPackagesPage } from "./_components/my-packages-page/MyPackagesPage";

export const metadata: Metadata = {
  title: "Your packages",
  description: "Owned session packages.",
};

export default async function Page() {
  const principal = await getServerMockPrincipal();
  const adapter = getMockAdapter();
  const [entitlements, acquisitions, catalogue] = await Promise.all([
    adapter.getMyEntitlements(principal.customerId),
    adapter.getMyAcquisitions(principal.customerId),
    adapter.getPublicBundles(),
  ]);
  return (
    <MyPackagesPage entitlements={entitlements} acquisitions={acquisitions} catalogue={catalogue} />
  );
}
