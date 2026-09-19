import type { Metadata } from "next";
import { CoachListPage } from "@/modules/admin/CoachPages";

export const metadata: Metadata = {
  title: "Coaches",
  description: "Coach management.",
};

export default function Page() {
  return <CoachListPage />;
}
