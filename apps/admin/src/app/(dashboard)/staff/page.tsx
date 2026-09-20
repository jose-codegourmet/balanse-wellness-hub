import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminStaffQuery } from "@/lib/query/queries";
import { StaffListPage } from "@/modules/admin/StaffPages";

export const metadata: Metadata = {
  title: "Staff",
  description: "Staff management.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin([adminStaffQuery(principal.role)], <StaffListPage />);
}
