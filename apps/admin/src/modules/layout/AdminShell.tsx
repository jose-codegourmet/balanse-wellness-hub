"use client";

import { usePathname, useRouter } from "next/navigation";
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
          setPrincipal({ role: "guest" });
          router.push("/login");
          router.refresh();
        }}
        onSettings={() => router.push("/settings")}
        pathname={pathname}
      />
      <div className="min-w-0 flex-1 overflow-x-hidden bg-background">{children}</div>
    </div>
  );
}
