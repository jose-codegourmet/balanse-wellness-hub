import { AdminGuard } from "@/modules/layout/AdminGuard";
import { AdminShell } from "@/modules/layout/AdminShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>
        <div className="px-4 py-8 md:px-8">{children}</div>
      </AdminShell>
    </AdminGuard>
  );
}
