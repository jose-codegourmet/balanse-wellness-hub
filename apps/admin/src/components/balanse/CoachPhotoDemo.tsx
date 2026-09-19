"use client";

import { ImageUpload } from "@/components/balanse/ImageUpload";

export function CoachPhotoDemo() {
  return (
    <ImageUpload
      label="Coach profile photo"
      fallbackLabel="No coach photo. A silhouette fallback will be used."
    />
  );
}
