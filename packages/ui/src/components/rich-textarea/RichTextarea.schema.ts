import type * as React from "react";
import { z } from "zod";

/** Default value bound for the control and for `richTextareaSchema`. */
export const RICH_TEXTAREA_MAX_LENGTH = 2000;

export const richTextareaSchema = z.string().max(RICH_TEXTAREA_MAX_LENGTH);

export type RichTextareaValues = z.infer<typeof richTextareaSchema>;

export type RichTextareaProps = Omit<
  React.ComponentProps<"textarea">,
  "maxLength" | "rows" | "children"
> & {
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  preview?: boolean;
  invalid?: boolean;
};
