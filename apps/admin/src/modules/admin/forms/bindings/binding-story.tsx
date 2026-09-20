"use client";

import { useEffect } from "react";
import type { DefaultValues, FieldValues, Path } from "react-hook-form";
import type { ZodType } from "zod";
import { AdminForm, FormActions, FormField, useAdminFormContext } from "../AdminForm";
import type { FormFieldRenderProps } from "../AdminForm.schema";

export function BindingStory<TValues extends FieldValues>({
  schema,
  defaultValues,
  label,
  description,
  disabled = false,
  invalid = false,
  wireAria = false,
  orientation,
  children,
}: {
  schema: ZodType<TValues>;
  defaultValues: TValues;
  label: string;
  description?: string;
  disabled?: boolean;
  invalid?: boolean;
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
      {invalid ? <SeedFieldError name="value" message="This field is required" /> : null}
      <FormActions submitLabel="Save" />
    </AdminForm>
  );
}

export function SeedFieldError({ name, message }: { name: string; message: string }) {
  const { setError } = useAdminFormContext();
  useEffect(() => {
    setError(name as Path<FieldValues>, { type: "required", message });
  }, [message, name, setError]);
  return null;
}
