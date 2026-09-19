"use client";

import { BrandLockup, type NavLinkComponent, PublicNav } from "@balanse/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

const NextLink: NavLinkComponent = ({ href, className, children, onClick }) => (
  <Link href={href} className={className} onClick={onClick}>
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
    <PublicNav pathname={pathname} hash={hash} principalRole={principal.role} link={NextLink} />
  );
}

export function PublicFooter() {
  return (
    <footer data-section="footer" className="mt-auto border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground">
        <BrandLockup />
        <p>
          Cebu City · Marketing art uses the ASSET manifest; placeholders until approved files land.
        </p>
      </div>
    </footer>
  );
}
