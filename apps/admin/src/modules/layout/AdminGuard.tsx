"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AccessDenied } from "@/components/balanse/access-denied/AccessDenied";
import {
  canAccessAdminHref,
  firstImplementedPermittedAdminRoute,
} from "@/lib/authorization/admin-access";
import { useAdminAccessKind, useStaffActor } from "@/modules/authorization/useAdminAccess";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { principal } = useMockPrincipal();
  const actor = useStaffActor();
  const kind = useAdminAccessKind();
  const pathname = usePathname();
  const router = useRouter();
  const homeHref = firstImplementedPermittedAdminRoute(actor);
  const routeAllowed = canAccessAdminHref(actor, pathname ?? "/");

  useEffect(() => {
    if (kind === "unauthenticated") {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname ?? "/dashboard")}`);
    }
  }, [kind, pathname, router]);

  if (kind === "unauthenticated") {
    return <p className="px-4 py-8 text-sm text-muted-foreground">Redirecting to admin login…</p>;
  }

  if (kind === "forbidden") {
    return <AccessDenied kind="forbidden" />;
  }

  if (kind === "revoked") {
    return <AccessDenied kind="revoked" />;
  }

  if (principal.role === "admin" && !routeAllowed) {
    return <AccessDenied kind="denied" homeHref={homeHref} />;
  }

  return children;
}
