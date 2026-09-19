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
  imgClassName,
  loading = "lazy",
}: {
  assetId: string;
  className?: string;
  decorative?: boolean;
  preferMaster?: boolean;
  /** Tone of the brand frame shown if a slot ever loses its approved file. */
  frameTone?: BrandFrameTone;
  frameLabel?: string;
  frameCaption?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
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
      ratio={aspectRatioNumber(ratio)}
      className={cn("overflow-hidden rounded-xl bg-secondary/40", className)}
      data-asset-id={assetId}
      data-aspect-ratio={ratio}
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
        <>
          {/* 480px blur-up plate behind the full-size art (FE-PATHS.md thumbs). */}
          {bundled.thumbWebp ? (
            <picture>
              <source type="image/webp" srcSet={bundled.thumbWebp} />
              {bundled.thumbJpeg ? <source type="image/jpeg" srcSet={bundled.thumbJpeg} /> : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bundled.thumbJpeg ?? bundled.thumbWebp}
                alt=""
                aria-hidden="true"
                loading={loading}
                decoding="async"
                className="absolute inset-0 size-full scale-105 object-cover blur-lg"
              />
            </picture>
          ) : null}
          <picture>
            <source type="image/webp" srcSet={bundled.webp} />
            {bundled.jpeg ? <source type="image/jpeg" srcSet={bundled.jpeg} /> : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bundled.jpeg ?? bundled.webp}
              alt={alt}
              loading={loading}
              decoding="async"
              className={cn("relative size-full object-cover", imgClassName)}
              onError={() => setFailed(true)}
            />
          </picture>
        </>
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
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <CoachPicture sources={sources} alt={`Coach ${name}`} onError={() => setFailed(true)} />
      )}
    </AspectRatio>
  );
}
