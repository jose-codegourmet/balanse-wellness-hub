import type { Metadata } from "next";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export const metadata: Metadata = {
  title: "Session event",
  description: "Reserved session-event authoring route.",
};

/** Reserved authoring form, nested like recurrence. Does not render the form. */
export default async function SessionEventRoute({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <AdminPageShell
      title="Session event"
      description="Create or edit the event for this session. The form is not on this route yet."
      breadcrumb={[
        { label: "Schedule", href: "/schedule" },
        { label: sessionId, href: `/schedule/${sessionId}` },
        { label: "Event" },
      ]}
    />
  );
}
