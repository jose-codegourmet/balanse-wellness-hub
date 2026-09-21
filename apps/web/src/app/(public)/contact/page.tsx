import type { Metadata } from "next";
import { ContactPage } from "./_components/contact-page/ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Balansé Wellness Hub in Cebu. Reservations stay on the studio calendar.",
};

export default function Page() {
  return <ContactPage />;
}
