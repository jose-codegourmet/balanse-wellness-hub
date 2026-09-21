import type { Metadata } from "next";
import { FaqsPage } from "./_components/faqs-page/FaqsPage";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Booking, payment, waitlist, cancellation, and walk-in questions for Balansé.",
};

export default function Page() {
  return <FaqsPage />;
}
