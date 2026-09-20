import type { Metadata } from "next";
import { ProfileSectionRoute } from "../ProfileSectionRoute";

export const metadata: Metadata = {
  title: "Password settings",
  description: "Change the password on your Balansé account.",
};

export default function Page() {
  return <ProfileSectionRoute section="password" />;
}
