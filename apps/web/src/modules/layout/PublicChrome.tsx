"use client";

import { type NavLinkComponent, PublicFooter as PublicFooterUi, PublicNav } from "@balanse/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export const NextNavLink: NavLinkComponent = ({ href, className, children, onClick, ...rest }) => (
  <Link href={href} className={className} onClick={onClick} aria-current={rest["aria-current"]}>
    {children}
  </Link>
);

export function PublicHeader() {
  const pathname = usePathname();
  const { principal } = useMockPrincipal();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <PublicNav pathname={pathname} hash={hash} principalRole={principal.role} link={NextNavLink} />
  );
}

/** Compact chrome for signed-in portal pages. */
export function PublicFooter() {
  return <PublicFooterUi link={NextNavLink} />;
}
