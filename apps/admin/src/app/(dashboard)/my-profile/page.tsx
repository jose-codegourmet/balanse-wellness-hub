import {
  MOCK_HARNESS_COOKIE,
  parseMockPrincipal,
  resolveMockStaffActor,
} from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { canAccessAdminHref } from "@/lib/authorization/admin-access";
import { StaffProfilePage } from "./_components/staff-profile-page/StaffProfilePage";

export const metadata: Metadata = {
  title: "My profile",
  description: "Your staff account and notification preferences.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  if (!canAccessAdminHref(resolveMockStaffActor(principal), "/my-profile")) {
    return <AccessDenied kind="denied" />;
  }
  return <StaffProfilePage />;
}
