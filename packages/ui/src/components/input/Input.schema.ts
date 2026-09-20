import type * as React from "react";
import { z } from "zod";

import type { InputVariantProps } from "./Input";

export const inputSchema = z.string();
export type InputValues = z.infer<typeof inputSchema>;

export type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  InputVariantProps & {
    invalid?: boolean;
  };
