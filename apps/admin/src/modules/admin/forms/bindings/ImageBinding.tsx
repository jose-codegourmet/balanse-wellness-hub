"use client";

import { useFieldContext } from "@balanse/ui";
import { ImageUpload } from "@/components/balanse/ImageUpload";
import type { FormFieldRenderProps } from "../AdminForm.schema";

export type ImageBindingProps = FormFieldRenderProps & {
  label: string;
  fallbackLabel: string;
  previewName?: string;
};

/**
 * Value binding for `photoKey`. Replace always writes a new pending token —
 * it does not keep the previous key.
 */
export function ImageBinding({
  label,
  fallbackLabel,
  previewName,
  value,
  onChange,
  name,
}: ImageBindingProps) {
  const field = useFieldContext();
  const photoKey = typeof value === "string" && value.length > 0 ? value : null;

  return (
    <div
      id={field?.id}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
    >
      <ImageUpload
        label={label}
        fallbackLabel={fallbackLabel}
        photoKey={photoKey}
        previewName={previewName}
        onPhotoKeyChange={(next) => onChange(next)}
      />
      <input type="hidden" name={name} value={photoKey ?? ""} readOnly />
    </div>
  );
}
