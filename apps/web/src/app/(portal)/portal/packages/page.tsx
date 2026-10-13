import { listMyPackages, listPublicPackages } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";
import { MyPackagesPage } from "./_components/my-packages-page/MyPackagesPage";

export const metadata: Metadata = {
  title: "Your packages",
  description: "Owned session packages.",
};

export default async function Page() {
  const profile = await getCurrentCustomer();
  if (!profile) return <MyPackagesPage entitlements={[]} acquisitions={[]} catalogue={[]} />;
  const fetcher = serverFetcher(await getCustomerAccessToken());
  const [owned, catalogue] = await Promise.all([
    listMyPackages(fetcher),
    listPublicPackages(fetcher),
  ]);
  return (
    <MyPackagesPage
      entitlements={owned.items}
      acquisitions={owned.pendingAcquisitions}
      catalogue={catalogue.items}
    />
  );
}
