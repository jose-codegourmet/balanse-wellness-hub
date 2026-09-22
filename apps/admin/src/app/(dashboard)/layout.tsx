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
        <div className="min-h-dvh bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--primary)_5%,transparent),transparent_32%)] px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-[96rem]">{children}</div>
        </div>
        {modal}
      </AdminGuard>
    </AdminShell>
  );
}
