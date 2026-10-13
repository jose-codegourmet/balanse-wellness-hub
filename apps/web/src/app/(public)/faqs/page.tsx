import { getPublicContent } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { FaqsPage } from "./_components/faqs-page/FaqsPage";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Booking, payment, waitlist, cancellation, and walk-in questions for Balansé.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const content = await getPublicContent(serverFetcher(null));
  return <FaqsPage faqs={content.faqs} />;
}
