import type { Metadata } from "next";
import { SessionFormPage } from "@/modules/admin/SchedulePages";

export const metadata: Metadata = {
  title: "Session",
  description: "Create or edit a session.",
};

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <SessionFormPage sessionId={sessionId} />;
}
