import type { Metadata } from "next";
import { ClassListPage } from "@/modules/admin/ClassPages";

export const metadata: Metadata = {
  title: "Classes",
  description: "Class catalog.",
};

export default function Page() {
  return <ClassListPage />;
}
