import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentCustomer } from "@/modules/session/current-customer";
import { PackageDetailPage } from "../_components/package-detail-page/PackageDetailPage";

export const metadata: Metadata = {
  title: "Package",
  description: "Session package details.",
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const adapter = getMockAdapter();
  const bundle = await adapter.getPublicBundle(slug);
  if (!bundle) notFound();
  const profile = await getCurrentCustomer();
  const signedIn = Boolean(profile);
  const policies = signedIn ? await adapter.getCustomerFormPolicies("package_request") : [];
  return (
    <PackageDetailPage
      bundle={bundle}
      signedIn={signedIn}
      customerId={profile?.id}
      policies={policies}
    />
  );
}
