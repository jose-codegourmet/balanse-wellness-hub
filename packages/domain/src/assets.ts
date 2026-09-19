/** Aspect ratios required by FE-SHR-004 / the marketing image spec. */
export const MARKETING_ASPECT_RATIOS = ["16:9", "3:2", "1:1", "21:9", "4:3", "3:1", "4:5"] as const;

export type MarketingAspectRatio = (typeof MARKETING_ASPECT_RATIOS)[number];

export const ASPECT_RATIO_NUMBER: Record<MarketingAspectRatio, number> = {
  "16:9": 16 / 9,
  "3:2": 3 / 2,
  "1:1": 1,
  "21:9": 21 / 9,
  "4:3": 4 / 3,
  "3:1": 3 / 1,
  "4:5": 4 / 5,
};

export const LOCAL_PLACEHOLDER_PATHS = {
  coach4x5: "/assets/placeholders/coach-placeholder-4x5.svg",
  coach1x1: "/assets/placeholders/coach-placeholder-1x1.svg",
} as const;

export function isMarketingAspectRatio(value: string): value is MarketingAspectRatio {
  return (MARKETING_ASPECT_RATIOS as readonly string[]).includes(value);
}

export function aspectRatioNumber(ratio: string): number {
  if (isMarketingAspectRatio(ratio)) return ASPECT_RATIO_NUMBER[ratio];
  const [w, h] = ratio.split(":").map(Number);
  if (w > 0 && h > 0) return w / h;
  return 16 / 9;
}
