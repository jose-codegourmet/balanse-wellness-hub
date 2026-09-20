import type { Metadata } from "next";
import { ProfileSectionRoute } from "./ProfileSectionRoute";

export const metadata: Metadata = {
  title: "Basic profile",
  description: "Manage your Balansé profile details.",
};

export default function Page() {
  return <ProfileSectionRoute section="basic" />;
}
