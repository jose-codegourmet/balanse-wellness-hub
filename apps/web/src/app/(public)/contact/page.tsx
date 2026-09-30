import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { ContactPage } from "./_components/contact-page/ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Balansé Wellness Hub in Cebu. Reservations stay on the studio calendar.",
};

export default async function Page() {
  const policies = await getMockAdapter().getCustomerFormPolicies("contact");
  return <ContactPage policies={policies} />;
}
