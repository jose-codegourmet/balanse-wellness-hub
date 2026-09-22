import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerMockPrincipal } from "@/modules/session/server-principal";
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
  const principal = await getServerMockPrincipal();
  const signedIn = principal.role === "customer";
  return (
    <PackageDetailPage
      bundle={bundle}
      signedIn={signedIn}
      customerId={signedIn ? principal.customerId : undefined}
    />
  );
}
