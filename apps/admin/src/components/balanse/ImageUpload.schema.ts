import type { MockImageUploadProps } from "@balanse/ui";
import { z } from "zod";

/** Mock pending keys are not catalogued assets — CoachPhoto shows the crest. */
export const PENDING_PHOTO_KEY_PREFIX = "pending:" as const;

export const imageUploadSchema = z.string().nullable();

export type ImageUploadValues = z.infer<typeof imageUploadSchema>;

export type ImageUploadProps = MockImageUploadProps & {
  /** Saved catalog key, `pending:*` mock token, or null. */
  photoKey?: string | null;
  previewName?: string;
  /** Always writes the next key — never `??` against the previous value. */
  onPhotoKeyChange?: (photoKey: string | null) => void;
};
