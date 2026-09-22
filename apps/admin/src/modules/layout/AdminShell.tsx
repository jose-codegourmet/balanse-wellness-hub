"use client";

import { usePathname, useRouter } from "next/navigation";
import { AdminNotificationHeader } from "@/components/balanse/admin-notification-header/AdminNotificationHeader";
import { AdminSidebar } from "@/components/balanse/sidebar/admin-sidebar/AdminSidebar";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function AdminShell({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { setPrincipal } = useMockPrincipal();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <AdminSidebar
        defaultCollapsed={defaultCollapsed}
        onLogout={() => {
          setPrincipal({ role: "guest", staffId: null });
          router.push("/login");
          router.refresh();
        }}
        onSettings={() => router.push("/settings")}
        pathname={pathname}
      />
      <div className="min-w-0 flex-1 bg-background">
        <AdminNotificationHeader pathname={pathname} />
        {children}
      </div>
    </div>
  );
}
