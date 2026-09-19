"use client";

import { AdminNav, type NavLinkComponent } from "@balanse/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NextLink: NavLinkComponent = ({ href, className, children, onClick }) => (
  <Link href={href} className={className} onClick={onClick}>
    {children}
  </Link>
);

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminNav pathname={pathname} link={NextLink} />
      <div className="min-w-0 flex-1 bg-background">{children}</div>
    </div>
  );
}
