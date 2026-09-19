import type { Metadata } from "next";
import { RescheduleQueuePage } from "@/modules/admin/ReschedulePages";

export const metadata: Metadata = {
  title: "Reschedules",
  description: "Reschedule requests.",
};

export default function Page() {
  return <RescheduleQueuePage />;
}
