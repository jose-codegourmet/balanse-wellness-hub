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

export type CoachPhotoRole = "card" | "avatar" | "master";

export type CoachPhotoSources = {
  slug: string | null;
  role: CoachPhotoRole;
  webp: string;
  jpeg: string;
  srcSetWebp?: string;
  srcSetJpeg?: string;
  sizes?: string;
  masterWebp?: string;
  masterJpeg?: string;
  isPlaceholder: boolean;
};

export function coachPhotoKey(slug: string): string {
  return `coach-photos/${slug}`;
}

/** Admin-uploaded object: `coach-photos/<coachId>/<uuid>.<ext>` (BE-052). */
export const ADMIN_COACH_PHOTO_KEY_RE =
  /^coach-photos\/[^/]+\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.[a-zA-Z0-9]+$/;

export function isAdminUploadPhotoKey(photoKey: string | null): boolean {
  return Boolean(photoKey && ADMIN_COACH_PHOTO_KEY_RE.test(photoKey));
}

export function coachSlugFromPhotoKey(photoKey: string | null): string | null {
  if (!photoKey || photoKey.startsWith("http://") || photoKey.startsWith("https://")) return null;
  if (photoKey.startsWith("/")) return null;
  if (isAdminUploadPhotoKey(photoKey)) return null;
  const slug = photoKey.replace(/^coach-photos\//, "").split("/")[0] ?? "";
  return slug.length > 0 ? slug : null;
}

function publicHeadshot(slug: string, file: string): string {
  return `/assets/headshots/${slug}/${file}`;
}

export function localCoachPhotoPath(slug: string, ratio: "1:1" | "4:5"): string {
  return ratio === "1:1"
    ? publicHeadshot(slug, "headshot-1x1.webp")
    : publicHeadshot(slug, "headshot-card-4x5.webp");
}

export function localCoachMasterPath(slug: string, ext: "webp" | "jpg" = "jpg"): string {
  return publicHeadshot(slug, `headshot-upscaled-4k.${ext}`);
}

export function resolveCoachPhotoSources(
  photoKey: string | null,
  role: CoachPhotoRole = "card",
): CoachPhotoSources {
  const placeholder =
    role === "avatar" ? LOCAL_PLACEHOLDER_PATHS.coach1x1 : LOCAL_PLACEHOLDER_PATHS.coach4x5;
  const slug = coachSlugFromPhotoKey(photoKey);
  const hasDelivery = Boolean(slug && (COACHES_WITH_HEADSHOTS as readonly string[]).includes(slug));

  if (!hasDelivery || !slug) {
    return {
      slug,
      role,
      webp: photoKey?.startsWith("/") ? photoKey : placeholder,
      jpeg: photoKey?.startsWith("/") ? photoKey : placeholder,
      isPlaceholder: !photoKey?.startsWith("/"),
    };
  }

  if (role === "master") {
    return {
      slug,
      role,
      webp: localCoachMasterPath(slug, "webp"),
      jpeg: localCoachMasterPath(slug, "jpg"),
      masterWebp: localCoachMasterPath(slug, "webp"),
      masterJpeg: localCoachMasterPath(slug, "jpg"),
      isPlaceholder: false,
    };
  }

  if (role === "avatar") {
    return {
      slug,
      role,
      webp: publicHeadshot(slug, "headshot-1x1.webp"),
      jpeg: publicHeadshot(slug, "headshot-1x1.jpg"),
      srcSetWebp: [
        `${publicHeadshot(slug, "headshot-1x1-w200.webp")} 200w`,
        `${publicHeadshot(slug, "headshot-1x1-w400.webp")} 400w`,
        `${publicHeadshot(slug, "headshot-1x1.webp")} 800w`,
      ].join(", "),
      srcSetJpeg: [
        `${publicHeadshot(slug, "headshot-1x1-w200.jpg")} 200w`,
        `${publicHeadshot(slug, "headshot-1x1-w400.jpg")} 400w`,
        `${publicHeadshot(slug, "headshot-1x1.jpg")} 800w`,
      ].join(", "),
      sizes: "(max-width: 640px) 96px, 128px",
      masterWebp: localCoachMasterPath(slug, "webp"),
      masterJpeg: localCoachMasterPath(slug, "jpg"),
      isPlaceholder: false,
    };
  }

  return {
    slug,
    role: "card",
    webp: publicHeadshot(slug, "headshot-card-4x5.webp"),
    jpeg: publicHeadshot(slug, "headshot-card-4x5.jpg"),
    srcSetWebp: [
      `${publicHeadshot(slug, "headshot-card-4x5-w400.webp")} 400w`,
      `${publicHeadshot(slug, "headshot-card-4x5.webp")} 800w`,
      `${publicHeadshot(slug, "headshot-card-4x5-w1600.webp")} 1600w`,
    ].join(", "),
    srcSetJpeg: [
      `${publicHeadshot(slug, "headshot-card-4x5-w400.jpg")} 400w`,
      `${publicHeadshot(slug, "headshot-card-4x5.jpg")} 800w`,
      `${publicHeadshot(slug, "headshot-card-4x5-w1600.jpg")} 1600w`,
    ].join(", "),
    sizes:
      "(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc((100vw - 80px) / 2), 400px",
    masterWebp: localCoachMasterPath(slug, "webp"),
    masterJpeg: localCoachMasterPath(slug, "jpg"),
    isPlaceholder: false,
  };
}

/**
 * Maps a coach fixture `photoKey` (storage-style prefix or public path) to a
 * bundled FE path. Never returns a Storage URL. Cards use 4:5 crops; avatars use 1:1.
 */
export function resolveCoachPhotoSrc(
  photoKey: string | null,
  ratio: "1:1" | "4:5" = "4:5",
): string {
  return resolveCoachPhotoSources(photoKey, ratio === "1:1" ? "avatar" : "card").webp;
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
