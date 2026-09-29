"use client";
import { Button, CoachPhoto, useFieldContext } from "@balanse/ui";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { mintPendingPhotoKey } from "@/components/balanse/image-upload/ImageUpload";
import type { CoachPhotoFieldProps } from "./CoachPhotoField.meta";

export function CoachPhotoField({
  value,
  onChange,
  previewName,
  onPreviewChange,
}: CoachPhotoFieldProps) {
  const field = useFieldContext();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const photoKey = typeof value === "string" ? value : null;
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  return (
    <div className="coach-photo-picker">
      <div className="coach-photo-picker-image">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={`Selected portrait of ${previewName}`} />
        ) : (
          <CoachPhoto photoKey={photoKey} name={previewName} ratio="4:5" />
        )}
      </div>
      <div className="coach-photo-picker-controls">
        <Camera size={24} strokeWidth={1.3} aria-hidden="true" />
        <h3>{photoKey ? "Update their portrait" : "Introduce their face"}</h3>
        <p>
          Choose a clear, well-lit photo. Keep the face in the centre so it works at every size.
        </p>
        <input
          ref={input}
          id={field?.id}
          className="sr-only"
          type="file"
          tabIndex={-1}
          accept="image/*"
          aria-label="Choose coach portrait"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={field?.describedBy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
              setError("Choose an image file.");
              event.target.value = "";
              return;
            }
            if (file.size > 5 * 1024 * 1024) {
              setError("Choose an image smaller than 5 MB.");
              event.target.value = "";
              return;
            }
            setError(null);
            const nextPreview = URL.createObjectURL(file);
            setPreview(nextPreview);
            onPreviewChange?.(nextPreview);
            onChange(mintPendingPhotoKey());
            event.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => input.current?.click()}>
            {photoKey ? "Replace photo" : "Choose photo"}
          </Button>
          {photoKey && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setPreview(null);
                onPreviewChange?.(null);
                setError(null);
                onChange(null);
              }}
            >
              Remove photo
            </Button>
          )}
        </div>
        <small>Image files · Up to 5 MB</small>
        <p role="status" className={error ? "text-destructive!" : undefined}>
          {error ??
            (preview
              ? "New portrait selected. Save changes to keep it."
              : "Without a photo, the Balansé crest is shown.")}
        </p>
      </div>
    </div>
  );
}
