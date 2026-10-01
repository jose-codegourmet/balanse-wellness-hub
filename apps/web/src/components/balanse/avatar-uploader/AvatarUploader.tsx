"use client";

import {
  AVATAR_MIME_TYPES,
  AVATAR_OUTPUT_SIZE,
  AVATAR_VALIDATION_COPY,
  type AvatarValidationError,
  validateAvatarFile,
} from "@balanse/domain";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Slider,
  UserAvatar,
} from "@balanse/ui";
import { Camera, LoaderCircle, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { cn } from "@/lib/cn";
import { notify } from "@/modules/notifications/notify";
import type { AvatarUploaderProps } from "./AvatarUploader.meta";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.1;

type CropSource = { src: string; file: Blob | null; revoke: boolean };

type DrawableImage = CanvasImageSource & { width: number; height: number };

/** Decodes with EXIF orientation applied, so the crop matches what was shown. */
async function loadOrientedImage(source: Blob): Promise<DrawableImage> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(source, { imageOrientation: "from-image" });
    } catch {
      // Fall through to <img>, which also honours EXIF orientation.
    }
  }
  const url = URL.createObjectURL(source);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** 512×512 WEBP (JPEG fallback) on white, so transparent PNGs never turn black. */
export async function renderAvatarDataUrl(
  source: Blob,
  area: Area,
  size = AVATAR_OUTPUT_SIZE,
): Promise<string> {
  const image = await loadOrientedImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't crop photos.");
  context.fillStyle = "white";
  context.fillRect(0, 0, size, size);
  context.imageSmoothingQuality = "high";
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);
  if ("close" in image && typeof image.close === "function") image.close();
  const webp = canvas.toDataURL("image/webp", 0.9);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.9);
}

function clampZoom(value: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 100) / 100));
}

export function AvatarUploader({
  name,
  avatarUrl,
  seed,
  onSave,
  onRemove,
  disabled = false,
  className,
  initialState,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const [error, setError] = useState<string | null>(
    initialState?.kind === "error" ? AVATAR_VALIDATION_COPY[initialState.error] : null,
  );
  const [source, setSource] = useState<CropSource | null>(
    initialState?.kind === "crop" || initialState?.kind === "saving"
      ? { src: initialState.imageSrc, file: null, revoke: false }
      : null,
  );
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(ZOOM_MIN);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(initialState?.kind === "saving");
  const [cropError, setCropError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(initialState?.kind === "remove-confirm");
  const [removing, setRemoving] = useState(false);

  // Object URLs are released when the dialog closes or the component unmounts.
  useEffect(() => {
    return () => {
      if (source?.revoke) URL.revokeObjectURL(source.src);
    };
  }, [source]);

  function closeCrop() {
    setSource(null);
    setCropError(null);
    setSaving(false);
  }

  function pick(file: File | undefined) {
    if (!file) return;
    const problem: AvatarValidationError | null = validateAvatarFile(file);
    if (problem) {
      setError(AVATAR_VALIDATION_COPY[problem]);
      return;
    }
    setError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(ZOOM_MIN);
    setArea(null);
    setSource({ src: URL.createObjectURL(file), file, revoke: true });
  }

  async function save() {
    if (!source || !area) return;
    setSaving(true);
    setCropError(null);
    try {
      let blob: Blob;
      if (source.file) {
        blob = source.file;
      } else {
        const response = await fetch(source.src);
        blob = await response.blob();
      }
      const dataUrl = await renderAvatarDataUrl(blob, area);
      const failure = await onSave(dataUrl);
      if (failure) {
        setCropError(failure);
        setSaving(false);
        notify.error({ title: "Photo not saved", description: failure });
        return;
      }
      closeCrop();
      notify.success({ title: "Photo updated", description: "Looking good." });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "We couldn't save that photo.";
      setCropError(message);
      setSaving(false);
      notify.error({ title: "Photo not saved", description: message });
    }
  }

  async function remove() {
    setRemoving(true);
    const failure = await onRemove();
    setRemoving(false);
    if (failure) {
      notify.error({ title: "Photo not removed", description: failure });
      return;
    }
    setConfirmRemove(false);
    notify.success({ title: "Photo removed", description: "Your initials show instead." });
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)} data-slot="avatar-uploader">
      <UserAvatar name={name} avatarUrl={avatarUrl} seed={seed} size="xl" />
      <div className="grid min-w-0 gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            aria-describedby={error ? errorId : undefined}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-4" aria-hidden="true" />
            {avatarUrl ? "Change photo" : "Upload photo"}
          </Button>
          {avatarUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => setConfirmRemove(true)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Remove
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG or WEBP, up to 5 MB.</p>
        {error ? (
          <p id={errorId} role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_MIME_TYPES.join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            pick(event.target.files?.[0]);
            // Picking the same file twice should still reopen the cropper.
            event.target.value = "";
          }}
        />
      </div>

      <Dialog
        open={source !== null}
        onOpenChange={(open) => {
          if (!open && !saving) closeCrop();
        }}
      >
        <DialogContent className="gap-5 sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Crop your photo</DialogTitle>
            <DialogDescription>
              Drag to reposition (or use the arrow keys), then zoom to fit the circle.
            </DialogDescription>
          </DialogHeader>
          <div className="relative h-72 overflow-hidden rounded-lg bg-muted">
            {source ? (
              <Cropper
                image={source.src}
                crop={crop}
                zoom={zoom}
                minZoom={ZOOM_MIN}
                maxZoom={ZOOM_MAX}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={(next) => setZoom(clampZoom(next))}
                onCropComplete={(_, pixels) => setArea(pixels)}
                cropperProps={{ "aria-label": "Photo crop area" }}
              />
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Zoom out"
              disabled={saving || zoom <= ZOOM_MIN}
              onClick={() => setZoom((current) => clampZoom(current - ZOOM_STEP * 2))}
            >
              <Minus aria-hidden="true" />
            </Button>
            <Slider
              aria-label="Zoom"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={ZOOM_STEP / 10}
              value={[zoom]}
              disabled={saving}
              onValueChange={(next) => {
                const value = Array.isArray(next) ? next[0] : next;
                if (typeof value === "number") setZoom(clampZoom(value));
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Zoom in"
              disabled={saving || zoom >= ZOOM_MAX}
              onClick={() => setZoom((current) => clampZoom(current + ZOOM_STEP * 2))}
            >
              <Plus aria-hidden="true" />
            </Button>
          </div>
          {cropError ? (
            <p role="alert" className="text-sm text-destructive">
              {cropError}
            </p>
          ) : null}
          <DialogFooter className="mx-0 mb-0 rounded-none border-0 bg-transparent p-0">
            <Button type="button" variant="outline" disabled={saving} onClick={closeCrop}>
              Cancel
            </Button>
            <Button type="button" disabled={saving || !area} onClick={() => void save()}>
              {saving ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Saving…
                </>
              ) : (
                "Save photo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmRemove}
        onOpenChange={(open) => !removing && setConfirmRemove(open)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Remove your photo?</AlertDialogTitle>
            <AlertDialogDescription>
              Your initials will show instead. You can add a new photo anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Keep photo</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={removing}
              onClick={() => void remove()}
            >
              {removing ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              Remove photo
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
