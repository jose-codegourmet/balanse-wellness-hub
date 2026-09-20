"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

function tabId<T extends string>(tab: T | { id: T }): T {
  return typeof tab === "string" ? tab : tab.id;
}

/**
 * Sync the active admin tab with a search param. Unknown or missing values
 * fall back to `defaultId`. Writing the default id drops the param.
 */
export function useTabParam<T extends string>(
  param: string,
  tabs: readonly { id: T }[] | readonly T[],
  defaultId: T,
): [T, (next: T) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = useMemo(() => new Set(tabs.map((tab) => tabId(tab))), [tabs]);

  const raw = searchParams.get(param);
  const value = raw && allowed.has(raw as T) ? (raw as T) : defaultId;

  const setValue = useCallback(
    (next: T) => {
      if (!allowed.has(next)) return;
      const params = new URLSearchParams(searchParams.toString());
      if (next === defaultId) {
        params.delete(param);
      } else {
        params.set(param, next);
      }
      const serialized = params.toString();
      if (serialized === searchParams.toString()) return;
      router.replace(serialized ? `${pathname}?${serialized}` : pathname, { scroll: false });
    },
    [allowed, defaultId, param, pathname, router, searchParams],
  );

  return [value, setValue];
}
