"use client";
import { SIGNED_UPLOAD } from "@balanse/domain";
import { Button, cn } from "@balanse/ui";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { type DragEvent, useEffect, useId, useRef, useState } from "react";
import { useUploadAdminClassImage } from "@/lib/query/mutations";
import {
  CLASS_IMAGE_ASPECT,
  CLASS_IMAGE_MAX,
  type ClassImagesInputProps,
} from "./ClassImagesInput.schema";

const ACCEPT = SIGNED_UPLOAD.classImageTypes.join(",");
const MAX_MB = SIGNED_UPLOAD.maxBytes / (1024 * 1024);
/** Ratios this far from the recommendation get a soft "may be cropped" note. */
const RATIO_TOLERANCE = 0.15;

export function ClassImagesInput({
  value,
  onChange,
  onBlur,
  multiple = true,
  id,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
}: ClassImagesInputProps) {
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAdminClassImage();
  const [uploading, setUploading] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  // Local previews for fresh uploads so the tile renders before the CDN serves it.
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [offRatio, setOffRatio] = useState<Record<string, boolean>>({});
  const previewsRef = useRef(previews);
  previewsRef.current = previews;

  useEffect(
    () => () => {
      for (const url of Object.values(previewsRef.current)) URL.revokeObjectURL(url);
    },
    [],
  );

  const room = multiple ? CLASS_IMAGE_MAX - value.length : 1;
  const full = multiple && room <= 0;
  const hint = [
    `Recommended: ${CLASS_IMAGE_ASPECT.label} landscape, at least ${CLASS_IMAGE_ASPECT.minSize}.`,
    "Other sizes work but may be cropped.",
    `JPG, PNG or WebP, up to ${MAX_MB} MB${multiple ? ` each · ${room} of ${CLASS_IMAGE_MAX} left` : ""}.`,
  ].join(" ");

  async function accept(list: FileList | null | undefined) {
    const files = Array.from(list ?? []);
    if (!files.length) return;
    const problems: string[] = [];
    const valid = files.filter((file) => {
      if (!(SIGNED_UPLOAD.classImageTypes as readonly string[]).includes(file.type)) {
        problems.push(`${file.name}: use a JPG, PNG or WebP image.`);
        return false;
      }
      if (file.size > SIGNED_UPLOAD.maxBytes) {
        problems.push(`${file.name}: larger than ${MAX_MB} MB.`);
        return false;
      }
      return true;
    });
    const batch = valid.slice(0, Math.max(room, 0));
    if (valid.length > batch.length) {
      problems.push(
        `Only ${CLASS_IMAGE_MAX} gallery images are allowed; extra files were skipped.`,
      );
    }
    setErrors(problems);
    if (!batch.length) return;

    setUploading(batch.length);
    const results = await Promise.allSettled(batch.map((file) => upload.mutateAsync(file)));
    setUploading(0);
    const added: string[] = [];
    const nextPreviews: Record<string, string> = {};
    results.forEach((result, index) => {
      const file = batch[index] as File;
      if (result.status === "fulfilled") {
        added.push(result.value);
        nextPreviews[result.value] = URL.createObjectURL(file);
      } else {
        problems.push(`${file.name}: the upload failed. Try again.`);
      }
    });
    setErrors([...problems]);
    if (!added.length) return;
    setPreviews((prev) => ({ ...prev, ...nextPreviews }));
    onChange(multiple ? [...value, ...added] : added.slice(0, 1));
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (!full && !uploading) void accept(event.dataTransfer.files);
  }

  function checkRatio(src: string, image: HTMLImageElement) {
    if (!image.naturalWidth || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    const off = Math.abs(ratio / CLASS_IMAGE_ASPECT.ratio - 1) > RATIO_TOLERANCE;
    setOffRatio((prev) => (prev[src] === off ? prev : { ...prev, [src]: off }));
  }

  return (
    <div className="space-y-3">
      {value.length ? (
        <div className={multiple ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : "max-w-md"}>
          {value.map((src, index) => (
            <div key={src} className="relative overflow-hidden rounded-lg border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previews[src] ?? src}
                alt={multiple ? `Gallery image ${index + 1}` : "Class cover"}
                className="aspect-video w-full object-cover"
                onLoad={(event) => checkRatio(src, event.currentTarget)}
              />
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="grid text-xs text-muted-foreground">
                  {multiple ? `Image ${index + 1}` : "Cover image"}
                  {offRatio[src] ? (
                    <span>Not {CLASS_IMAGE_ASPECT.label} — may be cropped</span>
                  ) : null}
                </span>
                <div className="flex gap-1">
                  {multiple && index > 0 ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Move image ${index + 1} earlier`}
                      onClick={() => {
                        const next = [...value];
                        const previous = next[index - 1];
                        if (previous === undefined) return;
                        next[index - 1] = src;
                        next[index] = previous;
                        onChange(next);
                      }}
                    >
                      <ArrowLeft />
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={multiple ? `Remove image ${index + 1}` : "Remove cover image"}
                    onClick={() => onChange(value.filter((_, i) => i !== index))}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {full ? null : (
        <fieldset
          aria-label={multiple ? "Upload gallery images" : "Upload cover image"}
          className={cn(
            "m-0 flex min-w-0 flex-col items-start gap-3 rounded-lg border border-dashed p-4 transition-colors sm:flex-row sm:items-center",
            dragging && "border-primary bg-primary/5",
            invalid === true || invalid === "true" ? "border-destructive" : null,
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple={multiple}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              void accept(event.target.files);
              event.target.value = "";
            }}
          />
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={uploading > 0}
            aria-describedby={[hintId, describedBy].filter(Boolean).join(" ")}
            onBlur={onBlur}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <ImagePlus aria-hidden />
            )}
            {uploading
              ? `Uploading${uploading > 1 ? ` ${uploading} images` : ""}…`
              : multiple
                ? "Upload images"
                : value.length
                  ? "Replace cover"
                  : "Upload cover"}
          </Button>
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        </fieldset>
      )}

      {errors.length ? (
        <ul role="alert" className="space-y-1 text-xs text-destructive">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
