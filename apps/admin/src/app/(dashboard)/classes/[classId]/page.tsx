import type { Metadata } from "next";
import { ClassFormPage } from "@/modules/admin/ClassPages";

export const metadata: Metadata = {
  title: "Class",
  description: "Add or edit a class.",
};

export default async function Page({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  return <ClassFormPage classId={classId} />;
}
