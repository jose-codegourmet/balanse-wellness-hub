/**
 * Shared responsive breakpoints for Balansé screen review (FE-FND-011).
 * Calendar surfaces: mobile day / tablet week / desktop month.
 */
export const BALANSE_BREAKPOINTS = {
  mobile: 360,
  tablet: 768,
  desktop: 1280,
} as const;

export const BALANSE_BREAKPOINT_LABELS = {
  mobile: "Mobile day (360px)",
  tablet: "Tablet week (768px)",
  desktop: "Desktop month (1280px)",
} as const;

export type BalanseBreakpoint = keyof typeof BALANSE_BREAKPOINTS;
