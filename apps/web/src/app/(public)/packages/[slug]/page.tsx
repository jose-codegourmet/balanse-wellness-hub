import { getPublicPackage } from "@balanse/api-client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetcher } from "@/lib/query/fetcher";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";
import { PackageDetailPage } from "../_components/package-detail-page/PackageDetailPage";

export const metadata: Metadata = {
  title: "Package",
  description: "Session package details.",
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await getPublicPackage(serverFetcher(await getCustomerAccessToken()), slug)
    .then((result) => result.package)
    .catch(() => null);
  if (!bundle) notFound();
  const profile = await getCurrentCustomer();
  const signedIn = Boolean(profile);
  return <PackageDetailPage package={bundle} signedIn={signedIn} customerId={profile?.id} />;
}
