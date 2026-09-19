import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { CoachesPage } from "@/modules/public/CoachesPage";

export const metadata: Metadata = {
  title: "Coaches",
  description: "Meet the Balansé coaching roster.",
};

export default async function Page() {
  const coaches = await getMockAdapter().getPublicCoaches();
  return <CoachesPage coaches={coaches} />;
}
