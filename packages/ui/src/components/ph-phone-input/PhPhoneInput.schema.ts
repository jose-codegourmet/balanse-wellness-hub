import { isPhMobile, PH_MOBILE_ERROR } from "@balanse/domain";
import { z } from "zod";

import type { InputProps } from "../input/Input.schema";

export const phPhoneInputSchema = z
  .string()
  .refine((value) => value === "" || isPhMobile(value), { message: PH_MOBILE_ERROR });

export type PhPhoneInputValues = z.infer<typeof phPhoneInputSchema>;

export type PhPhoneInputProps = Omit<
  InputProps,
  "type" | "inputMode" | "value" | "defaultValue"
> & {
  value?: string;
  defaultValue?: string;
};
