import type { Metadata } from "next";
import { StaffListPage } from "@/modules/admin/StaffPages";

export const metadata: Metadata = {
  title: "Staff",
  description: "Staff management.",
};

export default function Page() {
  return <StaffListPage />;
}
