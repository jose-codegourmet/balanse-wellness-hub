import type { Metadata } from "next";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export const metadata: Metadata = {
  title: "Events",
  description: "Session events. List and detail screens are not this route’s implementation.",
};

/** Reserved index. The event list screen is a follow-up and must use getMockAdapter(). */
export default function EventsIndexRoute() {
  return (
    <AdminPageShell
      title="Events"
      description="One-off events tied to a scheduled session. The list is not on this route yet."
      breadcrumb={[{ label: "Events" }]}
    />
  );
}
