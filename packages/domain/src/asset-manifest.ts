import raw from "./asset-manifest.json";

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
