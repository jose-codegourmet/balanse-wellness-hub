"use client";

import {
  aspectRatioNumber,
  bundledAssetSrc,
  getAssetById,
  LOCAL_PLACEHOLDER_PATHS,
  type MarketingAspectRatio,
  resolveCoachPhotoSrc,
} from "@balanse/domain";
import { useState } from "react";
import { AspectRatio } from "../../components/aspect-ratio/AspectRatio";
import { cn } from "../../lib/utils";

export function MarketingImage({
  assetId,
  className,
  decorative = false,
}: {
  assetId: string;
  className?: string;
  decorative?: boolean;
}) {
  const asset = getAssetById(assetId);
  const ratio = asset?.aspect_ratio ?? "16:9";
  const bundled = asset ? bundledAssetSrc(asset) : undefined;
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !bundled || failed;
  const alt = decorative || !asset?.alt_text ? "" : asset.alt_text;

  return (
    <AspectRatio
      ratio={aspectRatioNumber(ratio)}
      className={cn("overflow-hidden rounded-xl bg-muted", className)}
      data-asset-id={assetId}
      data-aspect-ratio={ratio}
    >
      {showPlaceholder ? (
        <div
          className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#faf6ee,#e8d5b5)] px-4 text-center text-sm text-muted-foreground"
          role={decorative ? "presentation" : undefined}
        >
          {decorative ? null : (
            <span>
              {asset
                ? `${asset.page} · ${asset.slot} (${asset.aspect_ratio}) — awaiting approved art`
                : `Missing asset “${assetId}”`}
            </span>
          )}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bundled}
          alt={alt}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </AspectRatio>
  );
}

export function CoachPhoto({
  photoKey,
  name,
  ratio = "1:1",
  className,
}: {
  photoKey: string | null;
  name: string;
  ratio?: Extract<MarketingAspectRatio, "1:1" | "4:5">;
  className?: string;
}) {
  const fallback =
    ratio === "4:5" ? LOCAL_PLACEHOLDER_PATHS.coach4x5 : LOCAL_PLACEHOLDER_PATHS.coach1x1;
  const src = resolveCoachPhotoSrc(photoKey, ratio);
  const [failed, setFailed] = useState(false);

  return (
    <AspectRatio
      ratio={aspectRatioNumber(ratio)}
      className={cn("overflow-hidden rounded-xl bg-muted", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={failed ? fallback : src}
        alt={failed ? `Placeholder portrait for ${name}` : `Coach ${name}`}
        className="size-full object-cover"
        onError={() => setFailed(true)}
      />
    </AspectRatio>
  );
}
