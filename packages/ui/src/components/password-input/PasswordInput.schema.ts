import { z } from "zod";

import type { InputProps } from "../input/Input.schema";

export const passwordInputSchema = z.string();
export type PasswordInputValues = z.infer<typeof passwordInputSchema>;

export type PasswordInputProps = Omit<InputProps, "type">;
