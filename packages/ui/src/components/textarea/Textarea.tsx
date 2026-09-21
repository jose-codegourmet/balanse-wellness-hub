"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { useLayoutEffect, useRef } from "react";

import { textareaSurfaceVariants } from "../../lib/control-surface";
import { cn } from "../../lib/utils";
import { useFieldContext } from "../field/Field";

import type { TextareaProps } from "./Textarea.schema";

const textareaVariants = cva("", {
  variants: {
    size: {
      sm: textareaSurfaceVariants({ size: "sm" }),
      md: textareaSurfaceVariants({ size: "md" }),
      lg: textareaSurfaceVariants({ size: "lg" }),
    },
  },
  defaultVariants: {
    size: "md",
  },
});

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
