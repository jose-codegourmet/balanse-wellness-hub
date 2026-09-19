import type { Metadata } from "next";
import { ReportDrilldownPage } from "@/modules/admin/ReportsPage";

export const metadata: Metadata = {
  title: "Session report",
  description: "Session performance drill-down.",
};

export default async function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <ReportDrilldownPage sessionId={sessionId} />;
}
