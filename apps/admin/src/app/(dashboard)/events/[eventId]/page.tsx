import type { Metadata } from "next";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export const metadata: Metadata = {
  title: "Event",
  description: "Reserved event detail route.",
};

/** Reserved detail. Does not load the event and does not call /api. */
export default async function EventDetailRoute({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return (
    <AdminPageShell
      title="Event"
      description="Event detail is reserved on this route."
      breadcrumb={[{ label: "Events", href: "/events" }, { label: eventId }]}
    />
  );
}
