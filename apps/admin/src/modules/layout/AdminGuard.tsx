"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { principal } = useMockPrincipal();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (principal.role !== "admin") {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, principal.role, router]);

  if (principal.role !== "admin") {
    return <p className="px-4 py-8 text-sm text-muted-foreground">Redirecting to admin login…</p>;
  }

  return children;
}
