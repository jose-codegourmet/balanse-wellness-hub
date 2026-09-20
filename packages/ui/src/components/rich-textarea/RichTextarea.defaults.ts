import type { RichTextareaProps } from "./RichTextarea.schema";
import { RICH_TEXTAREA_MAX_LENGTH } from "./RichTextarea.schema";

export const richTextareaDefaultValues: Partial<RichTextareaProps> = {
  defaultValue:
    "At Balansé, we promote holistic wellness by combining movement, fitness education, recovery, and tranquility.",
  maxLength: RICH_TEXTAREA_MAX_LENGTH,
  minRows: 4,
  maxRows: 12,
  preview: false,
  placeholder: "Write public-facing copy. Use the toolbar for bold, italic, links, and lists.",
};
