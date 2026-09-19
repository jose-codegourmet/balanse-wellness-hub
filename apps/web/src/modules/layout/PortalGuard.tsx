"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function PortalGuard({ children }: { children: React.ReactNode }) {
  const { principal } = useMockPrincipal();
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (principal.role === "guest") {
      const returnTo = `${pathname}${search.toString() ? `?${search.toString()}` : ""}`;
      router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [pathname, principal.role, router, search]);

  if (principal.role === "guest") {
    return <p className="px-4 py-8 text-sm text-muted-foreground">Redirecting to login…</p>;
  }

  return children;
}
