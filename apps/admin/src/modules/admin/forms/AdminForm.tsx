"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  useFieldContext,
} from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Children,
  isValidElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Controller,
  type FieldValues,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { notify } from "@/modules/notifications/notify";
import type {
  AdminFormProps,
  FormActionsProps,
  FormFieldProps,
  FormFieldRenderProps,
  FormSectionProps,
} from "./AdminForm.schema";
import {
  type AdminFieldMeta,
  AdminFormKitProvider,
  useAdminFormContext,
} from "./admin-form-context";
import { FormErrorSummary } from "./FormErrorSummary";
import { applyMappedErrors, mapValidationErrors } from "./map-validation-errors";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

export { useAdminFormContext } from "./admin-form-context";

export function AdminForm<TValues extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onSubmitError,
  children,
  className,
  id,
}: AdminFormProps<TValues>) {
  const form = useForm<TValues>({
    resolver: zodResolver(schema as never),
    defaultValues,
    mode: "onSubmit",
    shouldFocusError: true,
  });
  const metaRef = useRef<Record<string, AdminFieldMeta>>({});
  const [metaVersion, setMetaVersion] = useState(0);

  const registerField = useCallback((name: string, meta: AdminFieldMeta) => {
    metaRef.current[name] = meta;
    setMetaVersion((value) => value + 1);
  }, []);

  const unregisterField = useCallback((name: string) => {
    delete metaRef.current[name];
    setMetaVersion((value) => value + 1);
  }, []);

  const getLabel = useCallback((name: string) => {
    return metaRef.current[name]?.label ?? (name === "root" ? "Form" : name);
  }, []);

  const getFieldId = useCallback((name: string) => metaRef.current[name]?.id, []);

  const kit = useMemo(
    () => ({ registerField, unregisterField, getLabel, getFieldId }),
    [getFieldId, getLabel, registerField, unregisterField],
  );

  const childArray = Children.toArray(children);
  const actionChildren = childArray.filter(
    (child) => isValidElement(child) && child.type === FormActions,
  );
  const bodyChildren = childArray.filter(
    (child) => !(isValidElement(child) && child.type === FormActions),
  );

  async function handleValid(values: TValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      applyMappedErrors(form.setError, mapValidationErrors(error));
      onSubmitError?.(error);
    }
  }

  function handleInvalid() {
    notify.admin("form.validation-failed");
    onSubmitError?.(form.formState.errors);
    const first = firstErrorName(form.formState.errors);
    queueMicrotask(() => {
      if (!first) return;
      const fieldId = metaRef.current[first]?.id;
      if (fieldId) document.getElementById(fieldId)?.focus();
    });
  }

  return (
    <FormProvider {...form}>
      <AdminFormKitProvider value={kit}>
        <form
          id={id}
          className={className}
          noValidate
          onSubmit={form.handleSubmit(
            handleValid as Parameters<typeof form.handleSubmit>[0],
            handleInvalid,
          )}
        >
          <fieldset disabled={form.formState.isSubmitting} className="contents">
            <FieldGroup>
              {bodyChildren}
              <FormErrorSummary key={metaVersion} />
              {form.formState.errors.root?.message ? (
                <Field invalid>
                  <FieldError>{form.formState.errors.root.message}</FieldError>
                </Field>
              ) : null}
              {actionChildren}
            </FieldGroup>
          </fieldset>
        </form>
      </AdminFormKitProvider>
    </FormProvider>
  );
}

function firstErrorName(errors: Record<string, unknown>, prefix = ""): string | null {
  for (const [key, value] of Object.entries(errors)) {
    if (!value || typeof value !== "object") continue;
    const name = prefix ? `${prefix}.${key}` : key;
    if (key === "root") continue;
    if ("message" in value && (value as { message?: unknown }).message) return name;
    const nested = firstErrorName(value as Record<string, unknown>, name);
    if (nested) return nested;
  }
  return null;
}

export function FormField<TValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  wireAria = false,
  disabled = false,
  orientation = "vertical",
  children,
}: FormFieldProps<TValues>) {
  const { control, formState } = useFormContext<TValues>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          invalid={!!fieldState.error}
          disabled={formState.isSubmitting || disabled}
          orientation={orientation}
        >
          <FieldLabel>{label}</FieldLabel>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FormFieldControl
            name={String(name)}
            label={label}
            wireAria={wireAria}
            field={field}
            render={children}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

function FormFieldControl({
  name,
  label,
  wireAria,
  field,
  render,
}: {
  name: string;
  label: string;
  wireAria: boolean;
  field: {
    value: unknown;
    onChange: (...event: unknown[]) => void;
    onBlur: () => void;
    name: string;
    ref: React.RefCallback<HTMLElement | null>;
  };
  render: (props: FormFieldRenderProps) => ReactNode;
}) {
  const { registerField, unregisterField } = useAdminFormContext();
  const fieldContext = useFieldContext();

  const props: FormFieldRenderProps = {
    value: field.value,
    onChange: field.onChange,
    onBlur: field.onBlur,
    name: field.name,
    ref: field.ref,
  };

  if (wireAria && fieldContext) {
    props.id = fieldContext.id;
    props["aria-invalid"] = fieldContext.invalid || undefined;
    props["aria-describedby"] = fieldContext.describedBy;
  }

  const fieldId = fieldContext?.id;
  useEffect(() => {
    registerField(name, { label, id: fieldId });
    return () => unregisterField(name);
  }, [fieldId, label, name, registerField, unregisterField]);

  return <>{render(props)}</>;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="grid gap-4">
      <h2 className="font-display text-2xl">{title}</h2>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      <FieldGroup>{children}</FieldGroup>
    </section>
  );
}

export function FormActions({
  submitLabel,
  cancelHref,
  cancelLabel = "Cancel",
  className,
  children,
}: FormActionsProps) {
  const { formState } = useFormContext();
  const guard = useUnsavedChangesGuard(formState.isDirty);

  return (
    <div
      data-slot="form-actions"
      className={["flex flex-wrap items-center gap-2", className].filter(Boolean).join(" ")}
    >
      <Button type="submit" loading={formState.isSubmitting}>
        {submitLabel}
      </Button>
      {cancelHref ? (
        <Button type="button" variant="outline" onClick={() => guard.requestLeave(cancelHref)}>
          {cancelLabel}
        </Button>
      ) : null}
      {children}
      <AlertDialog
        open={guard.pendingHref !== null}
        onOpenChange={(open) => !open && guard.dismiss()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Leave this form and those edits are lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={guard.confirmLeave}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export type { AdminFormProps, FormActionsProps, FormFieldProps, FormSectionProps };
