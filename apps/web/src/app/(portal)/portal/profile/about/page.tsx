import type { Metadata } from "next";
import { ProfileSectionRoute } from "../_components/profile-section-route/ProfileSectionRoute";

export const metadata: Metadata = {
  title: "About you",
  description: "Your goals, experience and class interests.",
};

export default function Page() {
  return <ProfileSectionRoute section="about" />;
}
