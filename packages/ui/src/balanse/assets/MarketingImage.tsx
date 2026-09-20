"use client";

import {
  aspectRatioNumber,
  bundledAssetSources,
  getAssetById,
  LOCAL_PLACEHOLDER_PATHS,
  type MarketingAspectRatio,
  resolveCoachPhotoSources,
} from "@balanse/domain";
import { useState } from "react";
import { AspectRatio } from "../../components/aspect-ratio/AspectRatio";
import { cn } from "../../lib/utils";
import { BrandFrame, type BrandFrameTone } from "../brand/BrandFrame";

export function MarketingImage({
  assetId,
  className,
  decorative = false,
  preferMaster = false,
  frameTone = "cream",
  frameLabel,
  frameCaption,
  frameRatio,
  imgClassName,
  loading = "lazy",
  sizes = "(max-width: 640px) 100vw, 960px",
}: {
  assetId: string;
  className?: string;
  decorative?: boolean;
  preferMaster?: boolean;
  /** Tone of the brand frame shown if a slot ever loses its approved file. */
  frameTone?: BrandFrameTone;
  frameLabel?: string;
  frameCaption?: string;
  /**
   * Renders the slot at a ratio other than the asset's own, for compositions
   * that crop a delivery rather than show all of it. `data-aspect-ratio` keeps
   * reporting the asset's native ratio.
   */
  frameRatio?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
  sizes?: string;
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
      ? { webp: fromCoach.webp, jpeg: fromCoach.jpeg }
      : asset
        ? bundledAssetSources(asset)
        : undefined;
  const [failed, setFailed] = useState(false);
  const showFrame = !bundled || failed;
  const alt = decorative || !asset?.alt_text ? "" : asset.alt_text;

  return (
    <AspectRatio
      ratio={aspectRatioNumber(frameRatio ?? ratio)}
      className={cn("overflow-hidden rounded-xl bg-secondary/40", className)}
      data-asset-id={assetId}
      data-aspect-ratio={ratio}
      data-frame-ratio={frameRatio}
      data-asset-src={bundled?.webp}
      data-master-path={fromCoach?.masterJpeg}
    >
      {showFrame ? (
        <BrandFrame
          tone={frameTone}
          decorative={decorative}
          label={frameLabel}
          caption={decorative ? undefined : frameCaption}
        />
      ) : fromCoach && !fromCoach.isPlaceholder ? (
        <CoachPicture sources={fromCoach} alt={alt} onError={() => setFailed(true)} />
      ) : (
        <picture>
          <source
            type="image/webp"
            srcSet={srcSetFor(bundled.webp, bundled.thumbWebp)}
            sizes={sizes}
          />
          {bundled.jpeg ? (
            <source
              type="image/jpeg"
              srcSet={srcSetFor(bundled.jpeg, bundled.thumbJpeg)}
              sizes={sizes}
            />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bundled.jpeg ?? bundled.webp}
            alt={alt}
            loading={loading}
            decoding="async"
            className={cn("size-full object-cover", imgClassName)}
            onError={() => setFailed(true)}
          />
        </picture>
      )}
    </AspectRatio>
  );
}

/**
 * Offers the 480px `-thumb` delivery as a real srcset candidate so narrow and
 * low-bandwidth viewports fetch it instead of the 1600px master.
 */
function srcSetFor(full: string, thumb?: string): string {
  return thumb ? `${thumb} 480w, ${full} 1600w` : full;
}

function CoachPicture({
  sources,
  alt,
  onError,
  loading = "lazy",
}: {
  sources: ReturnType<typeof resolveCoachPhotoSources>;
  alt: string;
  onError: () => void;
  loading?: "lazy" | "eager";
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
        loading={loading}
        decoding="async"
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
  loading = "lazy",
}: {
  photoKey: string | null;
  name: string;
  ratio?: Extract<MarketingAspectRatio, "1:1" | "4:5">;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const crest =
    ratio === "4:5" ? LOCAL_PLACEHOLDER_PATHS.coach4x5 : LOCAL_PLACEHOLDER_PATHS.coach1x1;
  const sources = resolveCoachPhotoSources(photoKey, ratio === "1:1" ? "avatar" : "card");
  const [failed, setFailed] = useState(false);
  const useCrest = failed || sources.isPlaceholder;

  return (
    <AspectRatio
      ratio={aspectRatioNumber(ratio)}
      className={cn("overflow-hidden rounded-xl bg-secondary/40", className)}
      data-photo-role={sources.role}
      data-photo-kind={useCrest ? "crest" : "portrait"}
      data-master-path={sources.masterJpeg}
    >
      {useCrest ? (
        // ASSET-014 designed crest. Coaches without a catalogued, consented source
        // photo keep this finished artwork rather than a grey box or a broken image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={failed ? crest : sources.webp}
          alt={`Balansé crest artwork shown for ${name}`}
          loading={loading}
          decoding="async"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <CoachPicture
          sources={sources}
          alt={`Coach ${name}`}
          loading={loading}
          onError={() => setFailed(true)}
        />
      )}
    </AspectRatio>
  );
}
