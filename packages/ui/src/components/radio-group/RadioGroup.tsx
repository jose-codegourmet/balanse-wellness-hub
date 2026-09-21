"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { useId } from "react";

import { controlIndicatorStates } from "../../lib/control-surface";
import { cn } from "../../lib/utils";
import { useFieldContext } from "../field/Field";

import type { RadioGroupItemProps, RadioGroupProps } from "./RadioGroup.schema";

function RadioGroup({
  className,
  invalid,
  id,
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: RadioGroupProps) {
  const field = useFieldContext();
  const isInvalid = invalid ?? field?.invalid;

  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      id={id}
      disabled={disabled ?? field?.disabled}
      aria-invalid={ariaInvalid ?? (isInvalid || undefined)}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  );
}

function RadioGroupItem({ className, id, ...props }: RadioGroupItemProps) {
  const field = useFieldContext();
  const generatedId = useId();

  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      id={id ?? field?.id ?? generatedId}
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border after:absolute after:-inset-x-3 after:-inset-y-2 aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        controlIndicatorStates,
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
