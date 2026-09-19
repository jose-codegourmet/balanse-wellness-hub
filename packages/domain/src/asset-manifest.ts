import raw from "./asset-manifest.json";
import { COACHES_WITH_HEADSHOTS, LOCAL_PLACEHOLDER_PATHS, localCoachPhotoPath } from "./assets";

export type AssetManifestRecord = {
  id: string;
  page: "landing" | "about" | "contact" | "faqs" | "coaches";
  slot: string;
  slot_letter: string | null;
  aspect_ratio: string;
  source_prompt_key: string | null;
  alt_text: string;
  approval_status: string;
  storage_key: string | null;
  working_path?: string | null;
  /** ASSET-030 Storage URL. Recorded for WIRE-012; never fetched this phase. */
  public_url?: string | null;
  storage_objects?: readonly {
    working_path: string;
    storage_key: string;
    public_url: string;
  }[];
  generation_policy: string;
  coach_slug?: string | null;
};

export type AssetManifestFile = {
  schema_version: string;
  updated: string;
  notes?: string;
  assets: AssetManifestRecord[];
};

export const ASSET_MANIFEST = raw as AssetManifestFile;

export function getAssetById(id: string): AssetManifestRecord | undefined {
  return ASSET_MANIFEST.assets.find((asset) => asset.id === id);
}

export function getAssetsForPage(page: AssetManifestRecord["page"]): AssetManifestRecord[] {
  return ASSET_MANIFEST.assets.filter((asset) => asset.page === page);
}

export function publicPageSlotIds(page: AssetManifestRecord["page"]): string[] {
  return getAssetsForPage(page)
    .filter((asset) => asset.slot_letter)
    .map((asset) => asset.id);
}

/**
 * ASSET-015 specialty accents, in the order the coaches page shows them.
 * Group hero (coaches-b) is skipped — Alec / Sofia / Kate have no source photo.
 */
export const COACH_SPECIALTY_ACCENT_IDS = [
  "coaches-c-yoga",
  "coaches-c-boxing",
  "coaches-c-capoeira",
  "coaches-c-calisthenics",
  "coaches-c-pilates",
  "coaches-c-dance",
] as const;

/** Wide CTA-band slots from the pass-2 refresh (`docs/assets/marketing/FE-PATHS.md`). */
export const CTA_BAND_ASSET_IDS = {
  landingMid: "landing-e",
  landingFinal: "landing-d",
  aboutBand: "about-d",
} as const;

/** Lettered slots that have approved, bundled marketing art (not templates or skipped heroes). */
export function publishedMarketingSlotIds(page: AssetManifestRecord["page"]): string[] {
  return getAssetsForPage(page)
    .filter((asset) => {
      if (asset.approval_status !== "approved") return false;
      if (asset.id === "coaches-c") return false;
      if (asset.coach_slug || asset.generation_policy === "placeholder") return false;
      return Boolean(bundledAssetSrc(asset));
    })
    .map((asset) => asset.id);
}

/** Local/bundled path for this phase. Never a Storage URL. */
export function bundledAssetSrc(asset: AssetManifestRecord): string | undefined {
  const usesPlaceholder =
    asset.generation_policy === "placeholder" ||
    Boolean(asset.working_path?.includes("placeholders/"));
  if (usesPlaceholder) {
    return asset.aspect_ratio === "1:1" || asset.id.endsWith("-1x1")
      ? LOCAL_PLACEHOLDER_PATHS.coach1x1
      : LOCAL_PLACEHOLDER_PATHS.coach4x5;
  }
  if (
    asset.coach_slug &&
    asset.approval_status === "approved" &&
    (COACHES_WITH_HEADSHOTS as readonly string[]).includes(asset.coach_slug)
  ) {
    return localCoachPhotoPath(asset.coach_slug, asset.aspect_ratio === "1:1" ? "1:1" : "4:5");
  }
  if (
    asset.approval_status === "approved" &&
    asset.working_path?.startsWith("docs/assets/marketing/")
  ) {
    return `/${asset.working_path.replace(/^docs\//, "")}`;
  }
  return undefined;
}

export type BundledAssetSources = {
  webp: string;
  /** JPEG sibling delivered alongside every approved marketing file. */
  jpeg?: string;
  /** 480px long-edge pair from the pass-2 refresh, offered as a srcset candidate. */
  thumbWebp?: string;
  thumbJpeg?: string;
};

/**
 * Bundled `<picture>` sources for a marketing slot. Approved Higgsfield
 * deliveries ship `.webp` + `.jpg` side by side, plus a `-thumb` pair on every
 * refreshed slot.
 *
 * Every returned value is a repo-bundled `/assets/...` path. `storage_objects`
 * is consulted only for its repo-relative `working_path`; the `storage_key` and
 * `public_url` that ASSET-030 recorded are never read here, so rendering has no
 * runtime dependency on Supabase Storage. Serving from Storage is `WIRE-012`.
 */
export function bundledAssetSources(asset: AssetManifestRecord): BundledAssetSources | undefined {
  const webp = bundledAssetSrc(asset);
  if (!webp) return undefined;
  if (!webp.endsWith(".webp")) return { webp };

  const isMarketing = Boolean(asset.working_path?.startsWith("docs/assets/marketing/"));
  const hasJpegSibling = asset.storage_objects?.some((object) =>
    object.working_path.endsWith(".jpg"),
  );
  if (!hasJpegSibling && !isMarketing) return { webp };

  const base = webp.replace(/\.webp$/, "");
  return {
    webp,
    jpeg: `${base}.jpg`,
    ...(isMarketing && MARKETING_SLOTS_WITH_THUMBS.has(asset.id)
      ? { thumbWebp: `${base}-thumb.webp`, thumbJpeg: `${base}-thumb.jpg` }
      : {}),
  };
}

/**
 * Slots that shipped a `-thumb` pair in the pass-2 refresh. `about-c` and
 * `contact-b` were left unchanged and have no thumb (see FE-PATHS.md).
 */
const MARKETING_SLOTS_WITH_THUMBS = new Set([
  "landing-a",
  "landing-b",
  "landing-c",
  "landing-d",
  "landing-e",
  "about-a",
  "about-b",
  "about-d",
  "contact-a",
  "faqs-a",
  "coaches-c-yoga",
  "coaches-c-boxing",
  "coaches-c-capoeira",
  "coaches-c-calisthenics",
  "coaches-c-pilates",
  "coaches-c-dance",
]);

/** Master contact-sheet path when the map needs the ASSET-012 original. */
export function bundledMasterSrc(asset: AssetManifestRecord): string | undefined {
  if (
    asset.coach_slug &&
    (COACHES_WITH_HEADSHOTS as readonly string[]).includes(asset.coach_slug) &&
    asset.approval_status === "approved"
  ) {
    return `/assets/headshots/${asset.coach_slug}/headshot-4x5.jpg`;
  }
  return undefined;
}
