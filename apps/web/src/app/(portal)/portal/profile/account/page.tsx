import type { Metadata } from "next";
import { ProfileSectionRoute } from "../ProfileSectionRoute";

export const metadata: Metadata = {
  title: "Account settings",
  description: "See how you sign in to Balansé.",
};

export default function Page() {
  return <ProfileSectionRoute section="account" />;
}
