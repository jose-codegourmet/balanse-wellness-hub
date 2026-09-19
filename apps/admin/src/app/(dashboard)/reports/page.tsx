import type { Metadata } from "next";
import { ReportsPage } from "@/modules/admin/ReportsPage";

export const metadata: Metadata = {
  title: "Reports",
  description: "Sales and inventory reports.",
};

export default function Page() {
  return <ReportsPage />;
}
