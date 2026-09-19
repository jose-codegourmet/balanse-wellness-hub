"use client";

import { DownloadIcon, ImageIcon, UploadIcon } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/jabkit/button";
import { cn } from "@/components/jabkit/lib/cn";
import {
  type ImageCropperArea,
  type ImageCropperAspect,
  type ImageCropperError,
  type ImageCropperProps,
  imageCropperAcceptedTypes,
  imageCropperDefaultMaxFileBytes,
} from "./ImageCropper.types";

const ASPECT_OPTIONS: Array<{ value: ImageCropperAspect; label: string }> = [
  { value: "1:1", label: "Square" },
  { value: "4:3", label: "4:3" },
  { value: "16:9", label: "16:9" },
  { value: "free", label: "Free" },
];

const STAGE_PADDING = 16;
const PAN_STEP = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatFileLimit(bytes: number) {
  const mega = bytes / (1024 * 1024);
  if (mega >= 1) {
    const rounded = Number.isInteger(mega) ? mega.toString() : mega.toFixed(1);
    return `${rounded} MB`;
  }
  return `${bytes} bytes`;
}

function isAcceptedImageType(type: string) {
  return (imageCropperAcceptedTypes as readonly string[]).includes(type);
}

function aspectValue(
  aspect: ImageCropperAspect,
  viewportWidth: number,
  viewportHeight: number,
) {
  if (aspect === "1:1") return 1;
  if (aspect === "4:3") return 4 / 3;
  if (aspect === "16:9") return 16 / 9;
  const innerWidth = Math.max(1, viewportWidth - STAGE_PADDING * 2);
  const innerHeight = Math.max(1, viewportHeight - STAGE_PADDING * 2);
  return innerWidth / innerHeight;
}

function cropWindow(
  viewportWidth: number,
  viewportHeight: number,
  aspect: ImageCropperAspect,
) {
  const ratio = aspectValue(aspect, viewportWidth, viewportHeight);
  const availableWidth = Math.max(1, viewportWidth - STAGE_PADDING * 2);
  const availableHeight = Math.max(1, viewportHeight - STAGE_PADDING * 2);
  let width = availableWidth;
  let height = width / ratio;
  if (height > availableHeight) {
    height = availableHeight;
    width = height * ratio;
  }
  return {
    width,
    height,
    left: (viewportWidth - width) / 2,
    top: (viewportHeight - height) / 2,
  };
}

function minCoverScale(
  imageWidth: number,
  imageHeight: number,
  cropWidth: number,
  cropHeight: number,
) {
  return Math.max(cropWidth / imageWidth, cropHeight / imageHeight);
}

function panBounds(
  viewportWidth: number,
  viewportHeight: number,
  displayWidth: number,
  displayHeight: number,
  crop: ReturnType<typeof cropWindow>,
) {
  return {
    minX: crop.left + crop.width - viewportWidth / 2 - displayWidth / 2,
    maxX: crop.left - viewportWidth / 2 + displayWidth / 2,
    minY: crop.top + crop.height - viewportHeight / 2 - displayHeight / 2,
    maxY: crop.top - viewportHeight / 2 + displayHeight / 2,
  };
}

function cropAreaFromView(params: {
  imageWidth: number;
  imageHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  displayWidth: number;
  displayHeight: number;
  panX: number;
  panY: number;
  crop: ReturnType<typeof cropWindow>;
}): ImageCropperArea {
  const imageLeft =
    params.viewportWidth / 2 + params.panX - params.displayWidth / 2;
  const imageTop =
    params.viewportHeight / 2 + params.panY - params.displayHeight / 2;
  const scale = params.displayWidth / params.imageWidth;
  return {
    x: clamp((params.crop.left - imageLeft) / scale, 0, params.imageWidth),
    y: clamp((params.crop.top - imageTop) / scale, 0, params.imageHeight),
    width: clamp(params.crop.width / scale, 1, params.imageWidth),
    height: clamp(params.crop.height / scale, 1, params.imageHeight),
  };
}

export function ImageCropper({
  className,
  src,
  alt = "Image to crop",
  aspect: aspectProp = "1:1",
  defaultZoom = 1,
  minZoom = 1,
  maxZoom = 3,
  downloadFileName = "cropped-image.png",
  maxFileBytes = imageCropperDefaultMaxFileBytes,
  showReset = false,
  resetLabel = "Reset to sample",
  onCropChange,
  onFileChange,
  onUploadError,
  ...props
}: ImageCropperProps) {
  const fileInputId = useId();
  const headingId = useId();
  const zoomId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const [imageSrc, setImageSrc] = useState(src);
  const [aspect, setAspect] = useState<ImageCropperAspect>(aspectProp);
  const [zoom, setZoom] = useState(defaultZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ImageCropperError | null>(null);
  const lastGoodSrcRef = useRef<string | undefined>(src);
  const onUploadErrorRef = useRef(onUploadError);
  onUploadErrorRef.current = onUploadError;

  const reportError = useCallback((next: ImageCropperError | null) => {
    setError(next);
    onUploadErrorRef.current?.(next);
  }, []);

  useEffect(() => {
    setImageSrc(src);
    setError(null);
  }, [src]);

  useEffect(() => {
    setAspect(aspectProp);
  }, [aspectProp]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const rect = stage.getBoundingClientRect();
      setViewport({ width: rect.width, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const crop =
    viewport.width > 0
      ? cropWindow(viewport.width, viewport.height, aspect)
      : { width: 0, height: 0, left: 0, top: 0 };
  const coverScale =
    imageSize.width > 0 && crop.width > 0
      ? minCoverScale(
          imageSize.width,
          imageSize.height,
          crop.width,
          crop.height,
        )
      : 1;
  const displayScale = coverScale * zoom;
  const displayWidth = imageSize.width * displayScale;
  const displayHeight = imageSize.height * displayScale;
  const bounds =
    viewport.width > 0 && displayWidth > 0
      ? panBounds(
          viewport.width,
          viewport.height,
          displayWidth,
          displayHeight,
          crop,
        )
      : { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  const panX = clamp(pan.x, bounds.minX, bounds.maxX);
  const panY = clamp(pan.y, bounds.minY, bounds.maxY);
  const imageLeft = viewport.width / 2 + panX - displayWidth / 2;
  const imageTop = viewport.height / 2 + panY - displayHeight / 2;

  const area =
    imageSize.width > 0 && crop.width > 0
      ? cropAreaFromView({
          imageWidth: imageSize.width,
          imageHeight: imageSize.height,
          viewportWidth: viewport.width,
          viewportHeight: viewport.height,
          displayWidth,
          displayHeight,
          panX,
          panY,
          crop,
        })
      : null;
  const cropChange = onCropChange;
  const areaKey = area
    ? `${area.x.toFixed(2)}:${area.y.toFixed(2)}:${area.width.toFixed(2)}:${area.height.toFixed(2)}`
    : "";

  useEffect(() => {
    if (!areaKey || !cropChange || !area) return;
    cropChange(area);
  }, [area, areaKey, cropChange]);

  useEffect(() => {
    setPan((current) => {
      const next = {
        x: clamp(current.x, bounds.minX, bounds.maxX),
        y: clamp(current.y, bounds.minY, bounds.maxY),
      };
      if (next.x === current.x && next.y === current.y) return current;
      return next;
    });
  }, [bounds.maxX, bounds.maxY, bounds.minX, bounds.minY]);

  const replaceImage = useCallback(
    (nextSrc: string | undefined, file: File | null) => {
      if (objectUrlRef.current && objectUrlRef.current !== nextSrc) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = nextSrc?.startsWith("blob:") ? nextSrc : null;
      setImageSrc(nextSrc);
      setZoom(defaultZoom);
      setPan({ x: 0, y: 0 });
      setImageSize({ width: 0, height: 0 });
      onFileChange?.(file);
    },
    [defaultZoom, onFileChange],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!isAcceptedImageType(file.type)) {
        reportError({
          code: "type",
          message:
            "Use a JPEG, PNG, WebP, or GIF. This file was not accepted, and the current image was kept.",
        });
        return;
      }
      if (file.size > maxFileBytes) {
        reportError({
          code: "size",
          message: `This file is larger than ${formatFileLimit(maxFileBytes)}. Choose a smaller image. The current image was kept.`,
        });
        return;
      }
      reportError(null);
      replaceImage(URL.createObjectURL(file), file);
    },
    [maxFileBytes, replaceImage, reportError],
  );

  const resetToSample = useCallback(() => {
    reportError(null);
    replaceImage(src, null);
  }, [replaceImage, reportError, src]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!imageSrc || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX,
      panY,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPan({
      x: drag.panX + (event.clientX - drag.startX),
      y: drag.panY + (event.clientY - drag.startY),
    });
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const nudge = (dx: number, dy: number) => {
    setPan((current) => ({ x: current.x + dx, y: current.y + dy }));
  };

  const downloadCrop = async () => {
    const image = imageRef.current;
    if (!image || !area) return;
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(area.width));
      canvas.height = Math.max(1, Math.round(area.height));
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(
        image,
        area.x,
        area.y,
        area.width,
        area.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  const previewWidth = 88;
  const previewHeight =
    crop.width > 0 ? (previewWidth * crop.height) / crop.width : previewWidth;
  const previewScale = crop.width > 0 ? previewWidth / crop.width : 1;

  return (
    <div
      className={cn(
        "flex w-full max-w-xl flex-col gap-4 rounded-[--radius] border border-border bg-card p-4 text-card-foreground shadow-sm",
        className,
      )}
      data-slot="image-cropper"
      {...props}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium" id={headingId}>
          Image cropper
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload a photo, then zoom and pan to frame the crop.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="text-xs font-medium text-muted-foreground">
          Aspect ratio
        </legend>
        <div className="flex flex-wrap gap-2">
          {ASPECT_OPTIONS.map((option) => (
            <Button
              aria-pressed={aspect === option.value}
              className="h-8 px-3 text-xs"
              key={option.value}
              onClick={() => setAspect(option.value)}
              size="sm"
              type="button"
              variant={aspect === option.value ? "secondary" : "ghost"}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </fieldset>

      <div
        aria-labelledby={headingId}
        className={cn(
          "relative h-72 overflow-hidden rounded-[--radius] border border-border bg-muted touch-none select-none",
          imageSrc ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        )}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
        onKeyDown={(event) => {
          if (!imageSrc) return;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            nudge(PAN_STEP, 0);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            nudge(-PAN_STEP, 0);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            nudge(0, PAN_STEP);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            nudge(0, -PAN_STEP);
          } else if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            setZoom((value) => clamp(value + 0.1, minZoom, maxZoom));
          } else if (event.key === "-" || event.key === "_") {
            event.preventDefault();
            setZoom((value) => clamp(value - 0.1, minZoom, maxZoom));
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        ref={stageRef}
        role="application"
        tabIndex={imageSrc ? 0 : -1}
      >
        {imageSrc ? (
          <>
            <img
              alt={alt}
              className="pointer-events-none absolute max-w-none origin-top-left motion-reduce:transition-none"
              draggable={false}
              height={displayHeight}
              onLoad={(event) => {
                lastGoodSrcRef.current = event.currentTarget.currentSrc;
                setImageSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                });
              }}
              onError={() => {
                reportError({
                  code: "decode",
                  message:
                    "This file could not be read as an image. The previous image was restored when one was available.",
                });
                const fallback = lastGoodSrcRef.current?.startsWith("blob:")
                  ? src
                  : (lastGoodSrcRef.current ?? src);
                if (fallback && fallback !== imageSrc) {
                  replaceImage(fallback, null);
                }
              }}
              ref={imageRef}
              src={imageSrc}
              style={{
                width: displayWidth,
                height: displayHeight,
                transform: `translate(${imageLeft}px, ${imageTop}px)`,
              }}
              width={displayWidth}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute rounded-[calc(var(--radius)-2px)] shadow-[0_0_0_9999px] shadow-foreground/55 ring-2 ring-background"
              style={{
                left: crop.left,
                top: crop.top,
                width: crop.width,
                height: crop.height,
              }}
            />
          </>
        ) : (
          <label
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground"
            htmlFor={fileInputId}
          >
            <ImageIcon className="size-8 text-foreground" />
            Drop a JPEG, PNG, WebP, or GIF here, or choose a file to crop. Files
            larger than {formatFileLimit(maxFileBytes)} are not loaded.
          </label>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="flex items-center justify-between text-xs font-medium text-muted-foreground"
          htmlFor={zoomId}
        >
          Zoom
          <span className="tabular-nums text-foreground">
            {zoom.toFixed(1)}×
          </span>
        </label>
        <input
          aria-valuemax={maxZoom}
          aria-valuemin={minZoom}
          aria-valuenow={zoom}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!imageSrc}
          id={zoomId}
          max={maxZoom}
          min={minZoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          step={0.05}
          type="range"
          value={zoom}
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Preview</p>
          <div
            className="overflow-hidden rounded-[--radius] border border-border bg-muted"
            style={{ width: previewWidth, height: previewHeight }}
          >
            {imageSrc && crop.width > 0 ? (
              <img
                alt=""
                aria-hidden="true"
                className="max-w-none"
                draggable={false}
                src={imageSrc}
                style={{
                  width: displayWidth * previewScale,
                  height: displayHeight * previewScale,
                  transform: `translate(${-(crop.left - imageLeft) * previewScale}px, ${-(crop.top - imageTop) * previewScale}px)`,
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImageIcon className="size-4" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            accept={imageCropperAcceptedTypes.join(",")}
            className="sr-only"
            id={fileInputId}
            onChange={(event) => {
              handleFiles(event.target.files);
              event.currentTarget.value = "";
            }}
            type="file"
          />
          <Button asChild className="gap-2" size="sm" variant="secondary">
            <label className="cursor-pointer" htmlFor={fileInputId}>
              <UploadIcon className="size-4" />
              Upload
            </label>
          </Button>
          {showReset ? (
            <Button
              disabled={!src || imageSrc === src}
              onClick={resetToSample}
              size="sm"
              type="button"
              variant="ghost"
            >
              {resetLabel}
            </Button>
          ) : null}
          <Button
            className="gap-2"
            disabled={!imageSrc || !area || busy}
            onClick={() => {
              void downloadCrop();
            }}
            size="sm"
          >
            <DownloadIcon className="size-4" />
            {busy ? "Saving" : "Download"}
          </Button>
        </div>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Processing stays in this browser. Nothing is uploaded to a server.
          JPEG, PNG, WebP, or GIF up to {formatFileLimit(maxFileBytes)}.
        </p>
      )}
    </div>
  );
}
