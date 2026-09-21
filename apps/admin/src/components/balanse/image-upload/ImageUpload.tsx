"use client";

import { Button, CoachPhoto, MockImageUpload } from "@balanse/ui";
import { type ImageUploadProps, PENDING_PHOTO_KEY_PREFIX } from "./ImageUpload.schema";

export {
  type ImageUploadProps,
  type ImageUploadValues,
  imageUploadSchema,
  PENDING_PHOTO_KEY_PREFIX,
} from "./ImageUpload.schema";

export function isPendingPhotoKey(photoKey: string | null | undefined): boolean {
  return typeof photoKey === "string" && photoKey.startsWith(PENDING_PHOTO_KEY_PREFIX);
}

/** Mock-only token. Real key minting is BE-052 — do not synthesize from the coach name. */
export function mintPendingPhotoKey(): string {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
  return `${PENDING_PHOTO_KEY_PREFIX}${id}`;
}

export function ImageUpload({
  photoKey,
  previewName = "Coach",
  onPhotoKeyChange,
  label,
  chooseLabel,
  submitLabel = "Keep preview",
  fallbackLabel,
  onMockSubmit,
  ...rest
}: ImageUploadProps) {
  const hasPhoto = Boolean(photoKey);
  const showCoachPreview = photoKey !== undefined || Boolean(onPhotoKeyChange);
  const resolvedLabel = label ?? (hasPhoto ? "Replace Photo" : "Upload Photo");
  const resolvedChoose = chooseLabel ?? (hasPhoto ? "Replace Photo" : "Upload Photo");

  return (
    <div className="grid gap-4">
      {showCoachPreview ? (
        <div className="w-40">
          <CoachPhoto
            photoKey={isPendingPhotoKey(photoKey) ? null : (photoKey ?? null)}
            name={previewName}
            ratio="1:1"
            loading="eager"
          />
        </div>
      ) : null}
      <MockImageUpload
        {...rest}
        label={resolvedLabel}
        chooseLabel={resolvedChoose}
        submitLabel={submitLabel}
        fallbackLabel={fallbackLabel}
        onMockSubmit={async (file) => {
          await onMockSubmit?.(file);
          // Replace must overwrite. A pending token is not a stored asset (BE-052).
          onPhotoKeyChange?.(mintPendingPhotoKey());
        }}
      />
      {onPhotoKeyChange && hasPhoto ? (
        <Button type="button" variant="outline" onClick={() => onPhotoKeyChange(null)}>
          Remove Photo
        </Button>
      ) : null}
    </div>
  );
}
