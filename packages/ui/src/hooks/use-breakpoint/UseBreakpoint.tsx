"use client";

import { BALANSE_BREAKPOINTS, type BalanseBreakpoint } from "@balanse/config";

import { useMediaQuery } from "../use-media-query/UseMediaQuery";

export function useMinWidth(px: number): boolean {
  return useMediaQuery(`(min-width: ${px}px)`);
}

export function useIsMobile(): boolean {
  return !useMinWidth(BALANSE_BREAKPOINTS.tablet);
}

/**
 * Live Balansé viewport: `mobile` below 768, `tablet` at 768, `desktop` at 1280.
 * Server snapshot and the first client paint are `mobile`, then the value settles.
 */
export function useBreakpoint(): BalanseBreakpoint {
  const desktop = useMinWidth(BALANSE_BREAKPOINTS.desktop);
  const tablet = useMinWidth(BALANSE_BREAKPOINTS.tablet);
  if (desktop) return "desktop";
  if (tablet) return "tablet";
  return "mobile";
}
