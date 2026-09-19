"use client";

import { BrandLockup } from "@balanse/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const ADMIN_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/schedule", label: "Schedule" },
  { href: "/bookings", label: "Bookings" },
  { href: "/payments", label: "Payments" },
  { href: "/cancellations", label: "Cancellations" },
  { href: "/reschedules", label: "Reschedules" },
  { href: "/customers", label: "Customers" },
  { href: "/coaches", label: "Coaches" },
  { href: "/classes", label: "Classes" },
  { href: "/reports", label: "Reports" },
  { href: "/staff", label: "Staff" },
  { href: "/settings", label: "Settings" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:w-64 md:border-b-0 md:border-r">
        <div className="p-4">
          <BrandLockup tone="inverse" />
        </div>
        <nav aria-label="Admin" className="flex flex-row flex-wrap gap-1 px-2 pb-3 md:flex-col">
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm",
                  active ? "bg-sidebar-accent font-semibold" : "hover:bg-sidebar-accent/50",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 bg-background">{children}</div>
    </div>
  );
}
