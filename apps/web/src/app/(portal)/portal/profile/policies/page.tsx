import type { Metadata } from "next";
import { ProfileSectionRoute } from "../_components/profile-section-route/ProfileSectionRoute";

export const metadata: Metadata = {
  title: "Policies & waivers",
  description: "The Balansé documents you have accepted.",
};

export default function Page() {
  return <ProfileSectionRoute section="policies" />;
}
