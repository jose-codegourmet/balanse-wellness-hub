import type { Metadata } from "next";
import { CoachFormPage } from "@/modules/admin/CoachPages";

export const metadata: Metadata = {
  title: "Coach",
  description: "Coach profile and internal rate.",
};

export default async function Page({ params }: { params: Promise<{ coachId: string }> }) {
  const { coachId } = await params;
  return <CoachFormPage coachId={coachId} />;
}
