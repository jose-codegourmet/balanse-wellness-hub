import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { AboutPage } from "@/modules/public/AboutPage";

export const metadata: Metadata = {
  title: "About",
  description: "About Balansé Wellness Hub — movement, wellness, and community in Cebu.",
};

export default async function Page() {
  const coaches = await getMockAdapter().getPublicCoaches();
  return <AboutPage coaches={coaches} />;
}
