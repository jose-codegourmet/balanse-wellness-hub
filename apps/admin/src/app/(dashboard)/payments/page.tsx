import type { Metadata } from "next";
import { PaymentReviewPage } from "@/modules/admin/PaymentPages";

export const metadata: Metadata = {
  title: "Payments",
  description: "Payment review.",
};

export default function Page() {
  return <PaymentReviewPage />;
}
