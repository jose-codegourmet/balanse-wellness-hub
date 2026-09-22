import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { PackagesPage } from "./_components/packages-page/PackagesPage";

export const metadata: Metadata = {
  title: "Packages",
  description: "Session packages at Balansé Wellness Hub.",
};

export default async function Page() {
  const bundles = await getMockAdapter().getPublicBundles();
  return <PackagesPage bundles={bundles} />;
}
