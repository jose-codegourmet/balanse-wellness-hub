"use client";

import { ChevronDownIcon } from "lucide-react";

import { controlSizeClass, controlSurfaceVariants } from "../../lib/control-surface";
import { cn } from "../../lib/utils";
import { useFieldContext } from "../field/Field";

import type {
  NativeSelectOptGroupProps,
  NativeSelectOptionProps,
  NativeSelectProps,
} from "./NativeSelect.schema";

function NativeSelect({
  className,
  size = "md",
  invalid,
  id,
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: NativeSelectProps) {
  const field = useFieldContext();
  const isInvalid = invalid ?? field?.invalid;

  return (
    <div
      className={cn(
        "group/native-select relative w-full has-[select:disabled]:opacity-50",
        className,
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        id={id ?? field?.id}
        disabled={disabled ?? field?.disabled}
        aria-invalid={ariaInvalid ?? (isInvalid || undefined)}
        aria-describedby={ariaDescribedBy ?? field?.describedBy}
        className={cn(
          controlSurfaceVariants({
            size: size === "default" ? "md" : size,
          }),
          "appearance-none pr-8 select-none selection:bg-primary selection:text-primary-foreground data-[size=sm]:rounded-[min(var(--radius-md),10px)]",
          size === "default" && controlSizeClass.md,
        )}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({ className, ...props }: NativeSelectOptionProps) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

function NativeSelectOptGroup({ className, ...props }: NativeSelectOptGroupProps) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
