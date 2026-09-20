import type { Button as ButtonPrimitive } from "@base-ui/react/button";

import type { ButtonVariantProps } from "./Button";

export type ButtonProps = ButtonPrimitive.Props &
  ButtonVariantProps & {
    loading?: boolean;
  };
