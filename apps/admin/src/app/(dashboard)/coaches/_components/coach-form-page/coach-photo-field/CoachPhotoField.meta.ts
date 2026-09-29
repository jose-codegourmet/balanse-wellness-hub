import type { FormFieldRenderProps } from "@/modules/admin/forms/admin-form/AdminForm.schema";
/** Single portrait picker for the coach form. Previews locally, validates image/5MB,
 * and writes a pending mock key through the existing form binding. No upload request.
 * Removal clears both the saved key and local preview; object URLs are revoked.
 */
export type CoachPhotoFieldProps = FormFieldRenderProps & {
  previewName: string;
  onPreviewChange?: (url: string | null) => void;
};
