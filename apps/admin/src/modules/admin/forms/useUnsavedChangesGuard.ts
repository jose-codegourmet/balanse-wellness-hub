"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Dirty-form leave confirm. The Next App Router has no navigation-blocking
 * API — this covers the cancel control we own plus `beforeunload` for reloads
 * and tab closes. Sidebar and breadcrumb `router.push` / `<Link>` clicks are
 * not intercepted.
 */
export function useUnsavedChangesGuard(isDirty: boolean, navigate?: (href: string) => void) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const go = navigate ?? ((href: string) => router.push(href));

  useEffect(() => {
    if (!isDirty) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  function requestLeave(href: string) {
    if (!isDirty) {
      go(href);
      return;
    }
    setPendingHref(href);
  }

  function confirmLeave() {
    if (!pendingHref) return;
    const href = pendingHref;
    setPendingHref(null);
    go(href);
  }

  function dismiss() {
    setPendingHref(null);
  }

  return { pendingHref, requestLeave, confirmLeave, dismiss };
}

export type UnsavedChangesGuard = ReturnType<typeof useUnsavedChangesGuard>;
