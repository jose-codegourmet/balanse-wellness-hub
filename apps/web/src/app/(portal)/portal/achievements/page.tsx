import type { Metadata } from "next";
import { AchievementsPage } from "@/modules/customer/AchievementsPage";

export const metadata: Metadata = {
  title: "Achievements (TBD)",
  description: "Achievements are not in MVP scope.",
};

export default function Page() {
  return <AchievementsPage />;
}
