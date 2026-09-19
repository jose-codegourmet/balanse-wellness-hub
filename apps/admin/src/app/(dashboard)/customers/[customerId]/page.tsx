import type { Metadata } from "next";
import { CustomerDetailPage } from "@/modules/admin/CustomerPages";

export const metadata: Metadata = {
  title: "Customer detail",
  description: "Customer record.",
};

export default async function Page({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  return <CustomerDetailPage customerId={customerId} />;
}
