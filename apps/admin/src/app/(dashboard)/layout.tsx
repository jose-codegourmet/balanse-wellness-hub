import { cookies } from "next/headers";
import { ADMIN_SIDEBAR_COOKIE } from "@/components/balanse/sidebar/sidebar-nav";
import { AdminGuard } from "@/modules/layout/AdminGuard";
import { AdminShell } from "@/modules/layout/AdminShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const collapsed = (await cookies()).get(ADMIN_SIDEBAR_COOKIE)?.value === "collapsed";
  return (
    <AdminGuard>
      <AdminShell defaultCollapsed={collapsed}>
        <div className="px-4 py-8 md:px-8">{children}</div>
      </AdminShell>
    </AdminGuard>
  );
}
