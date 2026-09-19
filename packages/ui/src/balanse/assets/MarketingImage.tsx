"use client";

import {
  aspectRatioNumber,
  bundledAssetSrc,
  getAssetById,
  LOCAL_PLACEHOLDER_PATHS,
  type MarketingAspectRatio,
  resolveCoachPhotoSources,
} from "@balanse/domain";
import { useState } from "react";
import { AspectRatio } from "../../components/aspect-ratio/AspectRatio";
import { cn } from "../../lib/utils";

export function MarketingImage({
  assetId,
  className,
  decorative = false,
  preferMaster = false,
}: {
  assetId: string;
  className?: string;
  decorative?: boolean;
  preferMaster?: boolean;
}) {
  const asset = getAssetById(assetId);
  const ratio = asset?.aspect_ratio ?? "16:9";
  const role = preferMaster ? "master" : ratio === "1:1" ? "avatar" : "card";
  const fromCoach =
    asset?.coach_slug && asset.approval_status === "approved"
      ? resolveCoachPhotoSources(`coach-photos/${asset.coach_slug}`, role)
      : null;
  const bundled =
    fromCoach && !fromCoach.isPlaceholder
      ? fromCoach.webp
      : asset
        ? bundledAssetSrc(asset)
        : undefined;
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !bundled || failed;
  const alt = decorative || !asset?.alt_text ? "" : asset.alt_text;

  return (
    <AspectRatio
      ratio={aspectRatioNumber(ratio)}
      className={cn("overflow-hidden rounded-xl bg-muted", className)}
      data-asset-id={assetId}
      data-aspect-ratio={ratio}
      data-master-path={fromCoach?.masterJpeg}
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
      ) : fromCoach && !fromCoach.isPlaceholder ? (
        <CoachPicture sources={fromCoach} alt={alt} onError={() => setFailed(true)} />
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

function CoachPicture({
  sources,
  alt,
  onError,
}: {
  sources: ReturnType<typeof resolveCoachPhotoSources>;
  alt: string;
  onError: () => void;
}) {
  return (
    <picture>
      {sources.srcSetWebp ? (
        <source type="image/webp" srcSet={sources.srcSetWebp} sizes={sources.sizes} />
      ) : (
        <source type="image/webp" srcSet={sources.webp} />
      )}
      {sources.srcSetJpeg ? (
        <source type="image/jpeg" srcSet={sources.srcSetJpeg} sizes={sources.sizes} />
      ) : (
        <source type="image/jpeg" srcSet={sources.jpeg} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sources.jpeg}
        alt={alt}
        sizes={sources.sizes}
        className="size-full object-cover"
        onError={onError}
      />
    </picture>
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
  const sources = resolveCoachPhotoSources(photoKey, ratio === "1:1" ? "avatar" : "card");
  const [failed, setFailed] = useState(false);

  return (
    <AspectRatio
      ratio={aspectRatioNumber(ratio)}
      className={cn("overflow-hidden rounded-xl bg-muted", className)}
      data-photo-role={sources.role}
      data-master-path={sources.masterJpeg}
    >
      {failed || sources.isPlaceholder ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={failed ? fallback : sources.webp}
          alt={
            failed || sources.isPlaceholder ? `Placeholder portrait for ${name}` : `Coach ${name}`
          }
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <CoachPicture sources={sources} alt={`Coach ${name}`} onError={() => setFailed(true)} />
      )}
    </AspectRatio>
  );
}
