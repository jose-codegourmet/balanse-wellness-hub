import { listPublicPackages } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { getCustomerAccessToken } from "@/modules/session/current-customer";
import { PackagesPage } from "./_components/packages-page/PackagesPage";

export const metadata: Metadata = {
  title: "Packages",
  description: "Session packages at Balansé Wellness Hub.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const packages = await listPublicPackages(serverFetcher(await getCustomerAccessToken()));
  return <PackagesPage bundles={packages.items} />;
}
