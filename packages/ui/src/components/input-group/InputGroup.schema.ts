import type * as React from "react";

import type { Button } from "../button/Button";
import type { InputProps } from "../input/Input.schema";
import type { TextareaProps } from "../textarea/Textarea.schema";
import type { InputGroupAddonVariantProps, InputGroupButtonVariantProps } from "./InputGroup";

export type InputGroupProps = React.ComponentProps<"div">;
export type InputGroupAddonProps = React.ComponentProps<"div"> & InputGroupAddonVariantProps;
export type InputGroupButtonProps = Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  InputGroupButtonVariantProps & {
    type?: "button" | "submit" | "reset";
  };
export type InputGroupTextProps = React.ComponentProps<"span">;
export type InputGroupInputProps = InputProps;
export type InputGroupTextareaProps = TextareaProps;
