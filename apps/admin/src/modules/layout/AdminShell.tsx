"use client";

import { usePathname, useRouter } from "next/navigation";
import { AdminNotificationHeader } from "@/components/balanse/admin-notification-header/AdminNotificationHeader";
import { AdminSidebar } from "@/components/balanse/sidebar/admin-sidebar/AdminSidebar";
import { useCanAdminRoute } from "@/modules/authorization/useAdminAccess";
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
  const canOpenSettings = useCanAdminRoute("/settings");

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <AdminSidebar
        defaultCollapsed={defaultCollapsed}
        onLogout={() => {
          setPrincipal({ role: "guest", staffId: null });
          router.push("/login");
          router.refresh();
        }}
        onSettings={canOpenSettings ? () => router.push("/settings") : undefined}
        pathname={pathname}
      />
      <div className="min-w-0 flex-1 bg-background">
        <AdminNotificationHeader pathname={pathname} />
        {children}
      </div>
    </div>
  );
}
