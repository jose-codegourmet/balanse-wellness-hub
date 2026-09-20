import type * as React from "react";
import { z } from "zod";

import type { TextareaVariantProps } from "./Textarea";

export const textareaSchema = z.string();
export type TextareaValues = z.infer<typeof textareaSchema>;

export type TextareaProps = React.ComponentProps<"textarea"> &
  TextareaVariantProps & {
    invalid?: boolean;
    autoResize?: boolean;
  };
