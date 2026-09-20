import type { ReactNode } from "react";
import type { DefaultValues, FieldValues, Path } from "react-hook-form";
import type { ZodType } from "zod";
import type { UnsavedChangesGuard } from "./useUnsavedChangesGuard";

export type AdminFormProps<TValues extends FieldValues = FieldValues> = {
  schema: ZodType<TValues>;
  defaultValues: DefaultValues<TValues>;
  onSubmit: (values: TValues) => void | Promise<void>;
  onSubmitError?: (error: unknown) => void;
  children: ReactNode;
  className?: string;
  id?: string;
};

export type FormFieldRenderProps = {
  value: unknown;
  onChange: (...event: unknown[]) => void;
  onBlur: () => void;
  name: string;
  ref: React.RefCallback<HTMLElement | null>;
  id?: string;
  "aria-invalid"?: boolean | undefined;
  "aria-describedby"?: string | undefined;
};

export type FormFieldProps<TValues extends FieldValues = FieldValues> = {
  name: Path<TValues>;
  label: string;
  description?: string;
  /**
   * When true, the render prop also receives `id` / `aria-invalid` /
   * `aria-describedby` from `useFieldContext()`. Use only for controls that
   * do not self-wire: RichTextarea, DatePicker, TimePicker, MockImageUpload.
   */
  wireAria?: boolean;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal" | "responsive";
  children: (field: FormFieldRenderProps) => ReactNode;
};

export type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export type FormActionsProps = {
  submitLabel: string;
  /** When true, keep cancel + the unsaved-leave dialog without a submit control. */
  hideSubmit?: boolean;
  cancelHref?: string;
  cancelLabel?: string;
  className?: string;
  children?: ReactNode;
  /** Share one guard with a wizard shell so Escape / close use the same confirm. */
  guard?: UnsavedChangesGuard;
  /**
   * Associates the submit control with a portaled footer (dialog). Matches
   * `AdminForm`'s `id`.
   */
  formId?: string;
};
