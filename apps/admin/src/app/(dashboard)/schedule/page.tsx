import type { Metadata } from "next";
import { ScheduleListPage } from "@/modules/admin/SchedulePages";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Publish and manage sessions.",
};

export default function Page() {
  return <ScheduleListPage />;
}
