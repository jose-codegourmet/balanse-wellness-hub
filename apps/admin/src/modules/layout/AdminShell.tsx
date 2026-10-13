"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { AdminNotificationHeader } from "@/components/balanse/admin-notification-header/AdminNotificationHeader";
import { AdminSidebar } from "@/components/balanse/sidebar/admin-sidebar/AdminSidebar";
import { useCanAdminRoute } from "@/modules/authorization/useAdminAccess";
import { AdminRealtimeSync } from "@/modules/realtime/AdminRealtimeSync";

export function AdminShell({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const canOpenProfile = useCanAdminRoute("/my-profile");
  const canOpenStudioSettings = useCanAdminRoute("/settings");

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AdminRealtimeSync />
      <AdminSidebar
        defaultCollapsed={defaultCollapsed}
        onLogout={async () => {
          await fetch("/auth/sign-out", { method: "POST" });
          queryClient.clear();
          router.push("/login");
          router.refresh();
        }}
        onProfile={canOpenProfile ? () => router.push("/my-profile") : undefined}
        onStudioSettings={canOpenStudioSettings ? () => router.push("/settings") : undefined}
        pathname={pathname}
      />
      <div className="min-w-0 flex-1 bg-background">
        <AdminNotificationHeader pathname={pathname} />
        {children}
      </div>
    </div>
  );
}
