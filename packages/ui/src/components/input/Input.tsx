"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";

import { controlSurfaceVariants } from "../../lib/control-surface";
import { cn } from "../../lib/utils";
import { useFieldContext } from "../field/Field";

import type { InputProps } from "./Input.schema";

const inputVariants = cva(
  "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  {
    variants: {
      size: {
        sm: controlSurfaceVariants({ size: "sm" }),
        md: controlSurfaceVariants({ size: "md" }),
        lg: controlSurfaceVariants({ size: "lg" }),
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

function Input({
  className,
  type,
  size = "md",
  invalid,
  id,
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const field = useFieldContext();
  const isInvalid = invalid ?? field?.invalid;

  return (
    <InputPrimitive
      type={type}
      id={id ?? field?.id}
      disabled={disabled ?? field?.disabled}
      data-slot="input"
      data-size={size}
      aria-invalid={ariaInvalid ?? (isInvalid || undefined)}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  );
}

export type InputVariantProps = VariantProps<typeof inputVariants>;

export { Input, inputVariants };
