import type { Metadata } from "next";
import { FaqsPage } from "@/modules/public/FaqsPage";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Booking, payment, waitlist, cancellation, and walk-in questions for Balansé.",
};

export default function Page() {
  return <FaqsPage />;
}
