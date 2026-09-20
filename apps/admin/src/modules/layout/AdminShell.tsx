"use client";

import { AdminSidebar } from "@/components/balanse/AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1 bg-background">{children}</div>
    </div>
  );
}
