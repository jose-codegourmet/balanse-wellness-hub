"use client";

import { FeedbackState } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function RolesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <AdminPageShell
      title="Roles"
      breadcrumb={[{ label: "Staff", href: "/staff" }, { label: "Roles" }]}
    >
      <FeedbackState id="admin.roles-load-failed" className="mt-6" onAction={reset} />
    </AdminPageShell>
  );
}
