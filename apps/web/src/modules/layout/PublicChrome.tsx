"use client";

import { type NavLinkComponent, PublicFooter as PublicFooterUi } from "@balanse/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BalanseNavigation } from "@/components/balanse/marketing/BalanseNavigation";
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
  const [bookingVisible, setBookingVisible] = useState(pathname === "/");

  useEffect(() => {
    const booking = pathname === "/" ? document.getElementById("schedule") : null;
    if (!booking) {
      setBookingVisible(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setBookingVisible(entry.isIntersecting),
      // Ignore the part of the viewport covered by the sticky navigation.
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(booking);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <BalanseNavigation
      pathname={pathname}
      hash={hash}
      principalRole={principal.role}
      bookingVisible={bookingVisible}
    />
  );
}

/** Compact chrome for signed-in portal pages. */
export function PublicFooter() {
  return <PublicFooterUi link={NextNavLink} />;
}
