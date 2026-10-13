import { getFormPolicies, getPublicContent } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { ContactPage } from "./_components/contact-page/ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Balansé Wellness Hub in Cebu. Reservations stay on the studio calendar.",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const [{ items }, content] = await Promise.all([
    getFormPolicies(serverFetcher(null), "contact"),
    getPublicContent(serverFetcher(null)),
  ]);
  const policies = items.map((item) => ({
    id: item.id,
    documentName: item.documentName,
    version: item.version,
    promotedAt: "",
    current: true,
    body: item.body,
  }));
  return <ContactPage policies={policies} contact={content.contact} />;
}
