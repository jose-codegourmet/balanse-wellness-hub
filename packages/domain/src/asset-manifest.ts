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
  return undefined;
}

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
