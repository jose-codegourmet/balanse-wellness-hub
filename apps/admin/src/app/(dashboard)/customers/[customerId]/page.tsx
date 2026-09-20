import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminCustomerDetailQuery } from "@/lib/query/queries";
import { CustomerDetailPage } from "@/modules/admin/CustomerPages";

export const metadata: Metadata = {
  title: "Customer detail",
  description: "Customer record.",
};

export default async function Page({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [adminCustomerDetailQuery(principal.role, customerId)],
    <CustomerDetailPage customerId={customerId} />,
  );
}
