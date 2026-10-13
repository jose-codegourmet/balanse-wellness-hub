import { isClassImageSource } from "@balanse/domain";
import { z } from "zod";

export const CLASS_IMAGE_MAX = 12;
/** Advisory only: the public hero and gallery render full-width, landscape. Never enforced. */
export const CLASS_IMAGE_ASPECT = {
  ratio: 16 / 9,
  label: "16:9",
  minSize: "1920 × 1080 px",
} as const;

export const classImagesInputSchema = z
  .array(z.string())
  .max(CLASS_IMAGE_MAX, `Upload up to ${CLASS_IMAGE_MAX} images.`)
  .refine(
    (images) => images.every(isClassImageSource),
    "Every gallery image needs to be an uploaded image.",
  );
export type ClassImagesInputProps = {
  multiple?: boolean;
  id?: string;
  name?: string;
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
};
