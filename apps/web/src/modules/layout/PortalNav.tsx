"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const PORTAL_NAV = [
  { href: "/portal", label: "Home" },
  { href: "/portal/schedule", label: "Schedule" },
  { href: "/portal", label: "My Bookings", exact: true },
  { href: "/portal/profile", label: "Profile" },
  { href: "/portal/achievements", label: "Achievements (TBD)" },
] as const;

export function PortalNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Customer portal"
      className="flex flex-wrap gap-2 border-b border-border bg-card px-4 py-3"
    >
      {PORTAL_NAV.map((item) => {
        const active =
          item.href === "/portal" ? pathname === "/portal" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm",
              active ? "bg-secondary font-semibold" : "",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
