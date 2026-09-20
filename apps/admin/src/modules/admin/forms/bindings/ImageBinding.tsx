"use client";

import { useFieldContext } from "@balanse/ui";
import { useFormContext } from "react-hook-form";
import { ImageUpload } from "@/components/balanse/ImageUpload";
import type { FormFieldRenderProps } from "../AdminForm.schema";

export type ImageBindingProps = FormFieldRenderProps & {
  label: string;
  fallbackLabel: string;
  photoKeyField?: string;
  mockKey?: string;
};

/**
 * Action binding, not a value binding. `MockImageUpload` has no value
 * contract — a successful mock submit `setValue`s `photoKey`.
 */
export function ImageBinding({
  label,
  fallbackLabel,
  photoKeyField = "photoKey",
  mockKey = "uploads/mock",
  name,
}: ImageBindingProps) {
  const field = useFieldContext();
  const { setValue } = useFormContext();

  return (
    <div
      id={field?.id}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
    >
      <ImageUpload
        label={label}
        fallbackLabel={fallbackLabel}
        onMockSubmit={async () => {
          setValue(photoKeyField, mockKey, { shouldDirty: true, shouldValidate: true });
        }}
      />
      <input type="hidden" name={name} value="" readOnly />
    </div>
  );
}
