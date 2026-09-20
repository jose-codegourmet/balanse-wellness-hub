"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { useLayoutEffect, useRef } from "react";

import { cn } from "../../lib/utils";
import { useFieldContext } from "../field/Field";

import type { TextareaProps } from "./Textarea.schema";

const textareaVariants = cva(
  "flex field-sizing-content w-full rounded-lg border border-input bg-transparent text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 read-only:cursor-default read-only:bg-muted/50 read-only:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        sm: "min-h-12 px-2 py-1.5 text-[0.8rem] md:text-xs",
        md: "min-h-16 px-2.5 py-2",
        lg: "min-h-20 px-3 py-2.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

function Textarea({
  className,
  size = "md",
  rows = 3,
  autoResize = false,
  invalid,
  id,
  disabled,
  onChange,
  style,
  ref,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TextareaProps) {
  const field = useFieldContext();
  const isInvalid = invalid ?? field?.invalid;
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  const syncHeight = () => {
    const el = innerRef.current;
    if (!el || !autoResize) {
      return;
    }
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    syncHeight();
  });

  return (
    <textarea
      data-slot="textarea"
      data-size={size}
      rows={rows}
      id={id ?? field?.id}
      disabled={disabled ?? field?.disabled}
      aria-invalid={ariaInvalid ?? (isInvalid || undefined)}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      className={cn(
        textareaVariants({ size }),
        autoResize && "resize-none overflow-hidden",
        className,
      )}
      style={style}
      onChange={(event) => {
        syncHeight();
        onChange?.(event);
      }}
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      {...props}
    />
  );
}

export type TextareaVariantProps = VariantProps<typeof textareaVariants>;

export { Textarea, textareaVariants };
