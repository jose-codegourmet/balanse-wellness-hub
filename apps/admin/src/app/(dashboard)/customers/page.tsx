import type { Metadata } from "next";
import { CustomerListPage } from "@/modules/admin/CustomerPages";

export const metadata: Metadata = {
  title: "Customers",
  description: "Customer management.",
};

export default function Page() {
  return <CustomerListPage />;
}
