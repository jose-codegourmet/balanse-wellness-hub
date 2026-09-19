import { bundledAssetSources, getAssetById } from "@balanse/domain";

export type MarketingSlotImage = {
  src: string;
  alt: string;
};

/**
 * Jabkit marketing blocks take plain `src`/`alt` strings, so manifest slots are
 * resolved here instead of inside a vendored component. Only approved, bundled
 * ASSET-020–023 deliveries resolve; anything else returns `null` so a wrapper
 * can fall back to brand chrome rather than a broken image.
 */
export function marketingSlotImage(
  assetId: string,
  altOverride?: string,
): MarketingSlotImage | null {
  const asset = getAssetById(assetId);
  if (!asset) return null;
  const sources = bundledAssetSources(asset);
  if (!sources) return null;
  return { src: sources.jpeg ?? sources.webp, alt: altOverride ?? asset.alt_text ?? "" };
}

export function marketingSlotSrc(assetId: string): string | undefined {
  return marketingSlotImage(assetId)?.src;
}
