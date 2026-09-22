import { cookies } from "next/headers";
import { ADMIN_SIDEBAR_COOKIE } from "@/components/balanse/sidebar/sidebar-cookie";
import { AdminGuard } from "@/modules/layout/AdminGuard";
import { AdminShell } from "@/modules/layout/AdminShell";

export default async function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const collapsed = (await cookies()).get(ADMIN_SIDEBAR_COOKIE)?.value === "collapsed";
  return (
    <AdminShell defaultCollapsed={collapsed}>
      <AdminGuard>
        <div className="px-4 py-8 md:px-8">{children}</div>
        {modal}
      </AdminGuard>
    </AdminShell>
  );
}
