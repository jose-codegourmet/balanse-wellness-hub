import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminSettingsQuery } from "@/lib/query/queries";
import { SettingsPage } from "@/modules/admin/SettingsPage";

export const metadata: Metadata = {
  title: "Settings",
  description: "Studio settings.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin([adminSettingsQuery(principal.role)], <SettingsPage />);
}
