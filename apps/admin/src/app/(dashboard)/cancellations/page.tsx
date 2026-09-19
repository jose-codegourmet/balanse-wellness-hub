import type { Metadata } from "next";
import { CancellationQueuePage } from "@/modules/admin/CancellationPages";

export const metadata: Metadata = {
  title: "Cancellations",
  description: "Cancellation requests.",
};

export default function Page() {
  return <CancellationQueuePage />;
}
