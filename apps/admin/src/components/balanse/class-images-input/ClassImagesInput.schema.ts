import { isClassImageSource } from "@balanse/domain";
import { z } from "zod";
export const classImagesInputSchema = z
  .array(z.string())
  .max(12, "Choose up to 12 images.")
  .refine(
    (images) => images.every(isClassImageSource),
    "Every gallery image needs a local asset path or HTTPS image URL.",
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
