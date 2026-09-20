"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { useFieldContext } from "../field/Field";

import type { InputProps } from "./Input.schema";

const inputVariants = cva(
  "w-full min-w-0 rounded-lg border border-input bg-transparent text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 read-only:cursor-default read-only:bg-muted/50 read-only:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        sm: "h-7 px-2 py-0.5 text-[0.8rem] md:text-xs",
        md: "h-8 px-2.5 py-1",
        lg: "h-9 px-3 py-1.5",
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
