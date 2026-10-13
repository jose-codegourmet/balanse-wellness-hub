import type { Metadata } from "next";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import { canAccessAdminHref } from "@/lib/authorization/admin-access";
import { getStaffSession } from "@/modules/session/current-staff";
import { StaffProfilePage } from "./_components/staff-profile-page/StaffProfilePage";

export const metadata: Metadata = {
  title: "My profile",
  description: "Your staff account and notification preferences.",
};

export default async function Page() {
  const { actor } = await getStaffSession();
  if (!canAccessAdminHref(actor, "/my-profile")) {
    return <AccessDenied kind="denied" />;
  }
  return <StaffProfilePage />;
}
