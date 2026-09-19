import type { Metadata } from "next";
import { StaffDetailPage } from "@/modules/admin/StaffPages";

export const metadata: Metadata = {
  title: "Staff detail",
  description: "Provision or edit staff.",
};

export default async function Page({ params }: { params: Promise<{ staffId: string }> }) {
  const { staffId } = await params;
  return <StaffDetailPage staffId={staffId} />;
}
