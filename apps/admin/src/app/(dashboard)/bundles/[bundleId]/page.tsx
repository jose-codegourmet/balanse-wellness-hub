import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminBundlesQuery, adminClassesQuery } from "@/lib/query/queries";
import { BundleFormPage } from "../_components/bundle-form-page/BundleFormPage";

export const metadata: Metadata = {
  title: "Package",
  description: "Create or edit a session package.",
};

export default async function Page({ params }: { params: Promise<{ bundleId: string }> }) {
  const { bundleId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminBundlesQuery(principal), adminClassesQuery(principal)],
    <AdminQuerySuspense>
      <BundleFormPage bundleId={bundleId} />
    </AdminQuerySuspense>,
  );
}
