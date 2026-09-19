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

/** Eight ASSET-012 coaches with local delivery crops. Alec / Sofia / Kate stay on ASSET-014. */
export const COACHES_WITH_HEADSHOTS = [
  "ephraim-bacaltos",
  "rex-francis-regis",
  "rachelle-tobiano",
  "jodi-tio",
  "wolf",
  "mikaela-danielle",
  "maris-cabrera",
  "francis-acido",
] as const;

export const COACHES_ON_PLACEHOLDER = ["alec-james-co", "sofia-ocampo", "kate-go"] as const;

export function coachPhotoKey(slug: string): string {
  return `coach-photos/${slug}`;
}

export function localCoachPhotoPath(slug: string, ratio: "1:1" | "4:5"): string {
  if (ratio === "1:1") return `/assets/headshots/${slug}/headshot-1x1.webp`;
  return `/assets/headshots/${slug}/headshot-card-4x5.webp`;
}

/**
 * Maps a coach fixture `photoKey` (storage-style prefix or public path) to a
 * bundled FE path. Never returns a Storage URL.
 */
export function resolveCoachPhotoSrc(
  photoKey: string | null,
  ratio: "1:1" | "4:5" = "4:5",
): string {
  if (!photoKey) {
    return ratio === "1:1" ? LOCAL_PLACEHOLDER_PATHS.coach1x1 : LOCAL_PLACEHOLDER_PATHS.coach4x5;
  }
  if (photoKey.startsWith("/")) return photoKey;
  if (photoKey.startsWith("http://") || photoKey.startsWith("https://")) {
    return ratio === "1:1" ? LOCAL_PLACEHOLDER_PATHS.coach1x1 : LOCAL_PLACEHOLDER_PATHS.coach4x5;
  }
  const slug = photoKey.replace(/^coach-photos\//, "").split("/")[0] ?? "";
  if ((COACHES_WITH_HEADSHOTS as readonly string[]).includes(slug)) {
    return localCoachPhotoPath(slug, ratio);
  }
  return ratio === "1:1" ? LOCAL_PLACEHOLDER_PATHS.coach1x1 : LOCAL_PLACEHOLDER_PATHS.coach4x5;
}

export function isMarketingAspectRatio(value: string): value is MarketingAspectRatio {
  return (MARKETING_ASPECT_RATIOS as readonly string[]).includes(value);
}

export function aspectRatioNumber(ratio: string): number {
  if (isMarketingAspectRatio(ratio)) return ASPECT_RATIO_NUMBER[ratio];
  const [w, h] = ratio.split(":").map(Number);
  if (w > 0 && h > 0) return w / h;
  return 16 / 9;
}
