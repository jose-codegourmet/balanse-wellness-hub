import type { Metadata } from "next";
import { DashboardPage } from "@/modules/admin/DashboardPage";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Operations overview.",
};

export default function Page() {
  return <DashboardPage />;
}
