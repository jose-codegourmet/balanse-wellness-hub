"use client";

import { CustomerNav, type NavLinkComponent } from "@balanse/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NextLink: NavLinkComponent = ({ href, className, children, onClick }) => (
  <Link href={href} className={className} onClick={onClick}>
    {children}
  </Link>
);

export function PortalNav() {
  const pathname = usePathname();
  return <CustomerNav pathname={pathname} link={NextLink} />;
}
