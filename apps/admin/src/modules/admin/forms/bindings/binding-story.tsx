"use client";

import { useEffect } from "react";
import type { DefaultValues, FieldValues } from "react-hook-form";
import type { ZodType } from "zod";
import { AdminForm, FormActions, FormField } from "../AdminForm";
import type { FormFieldRenderProps } from "../AdminForm.schema";

export function BindingStory<TValues extends FieldValues>({
  schema,
  defaultValues,
  label,
  description,
  disabled = false,
  autoSubmit = false,
  wireAria = false,
  orientation,
  children,
}: {
  schema: ZodType<TValues>;
  defaultValues: TValues;
  label: string;
  description?: string;
  disabled?: boolean;
  autoSubmit?: boolean;
  wireAria?: boolean;
  orientation?: "vertical" | "horizontal" | "responsive";
  children: (field: FormFieldRenderProps) => React.ReactNode;
}) {
  return (
    <AdminForm
      schema={schema}
      defaultValues={defaultValues as DefaultValues<TValues>}
      onSubmit={async () => undefined}
    >
      <FormField
        name={"value" as never}
        label={label}
        description={description}
        disabled={disabled}
        wireAria={wireAria}
        orientation={orientation}
      >
        {children}
      </FormField>
      {autoSubmit ? <AutoSubmit /> : null}
      <FormActions submitLabel="Save" />
    </AdminForm>
  );
}

export function AutoSubmit() {
  useEffect(() => {
    document.querySelector("form")?.requestSubmit();
  }, []);
  return null;
}
