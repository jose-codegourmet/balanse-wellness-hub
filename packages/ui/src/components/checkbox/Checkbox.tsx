"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";
import { useId } from "react";

import { controlIndicatorStates } from "../../lib/control-surface";
import { cn } from "../../lib/utils";
import { useFieldContext } from "../field/Field";
import { OptionRow } from "../option-row/OptionRow";
import type { CheckboxGroupItemProps, CheckboxGroupProps, CheckboxProps } from "./Checkbox.schema";

function Checkbox({
  className,
  id,
  disabled,
  invalid,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: CheckboxProps) {
  const field = useFieldContext();
  const isInvalid = invalid ?? field?.invalid;

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      id={id ?? field?.id}
      disabled={disabled ?? field?.disabled}
      aria-invalid={ariaInvalid ?? (isInvalid || undefined)}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:data-checked:bg-primary dark:data-indeterminate:bg-primary",
        controlIndicatorStates,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon className="group-data-indeterminate/field:hidden [[data-indeterminate]_&]:hidden" />
        <MinusIcon className="hidden [[data-indeterminate]_&]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

function CheckboxGroup({ className, ...props }: CheckboxGroupProps) {
  return (
    <div
      data-slot="checkbox-group"
      role="group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  );
}

function CheckboxGroupItem({
  className,
  id,
  label,
  leading,
  description,
  disabled,
  ...props
}: CheckboxGroupItemProps) {
  const generatedId = useId();
  const optionId = id ?? generatedId;
  const descriptionId = `${optionId}-description`;
  const rich = leading != null || description != null;

  return (
    <div
      data-slot="checkbox-group-item"
      className={cn("flex items-start gap-2 text-sm", rich && "min-h-10 items-center", className)}
    >
      <Checkbox
        {...props}
        id={optionId}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
        className="mt-0.5"
      />
      <label htmlFor={optionId} className="min-w-0 flex-1 cursor-pointer">
        {rich ? (
          <OptionRow
            leading={leading}
            label={label}
            description={description}
            descriptionId={description ? descriptionId : undefined}
            reserveLeading={leading != null}
          />
        ) : (
          label
        )}
      </label>
    </div>
  );
}

export type {
  CheckboxGroupItemProps,
  CheckboxGroupOption,
  CheckboxGroupProps,
  CheckboxProps,
} from "./Checkbox.schema";
export { Checkbox, CheckboxGroup, CheckboxGroupItem };
