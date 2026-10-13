import type { ApiFetcher } from "@balanse/api-client";
import type { FormFieldRenderProps } from "@/modules/admin/forms/admin-form/AdminForm.schema";
/** Single portrait picker for the coach form. Previews locally, validates image/5MB,
 * then performs the real BE-052 mint → PUT → confirm lifecycle (WIRE-0604, #359) and only
 * writes the confirmed `photoKey` to form state on success — a failed upload leaves no
 * dangling key. `coachId` is `null` until the coach is first saved; the field shows a
 * "save first" state in that case, since the upload endpoint needs a real coach id.
 */
export type CoachPhotoFieldProps = FormFieldRenderProps & {
  coachId: string | null;
  fetcher: ApiFetcher;
  previewName: string;
  onPreviewChange?: (url: string | null) => void;
};
