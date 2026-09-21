import type { ImageUploadProps } from "./ImageUpload.schema";

export const imageUploadDefaultValues: Partial<ImageUploadProps> = {
  label: "Upload Photo",
  fallbackLabel: "Crest fallback when no photo is saved.",
  submitLabel: "Keep preview",
  photoKey: null,
  previewName: "Coach",
};
