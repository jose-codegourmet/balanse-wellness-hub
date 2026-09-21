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
import { type UnsavedChangesGuard, useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

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

  const submitRef = useRef<() => void>(() => {});

  const requestSubmit = useCallback(() => {
    submitRef.current();
  }, []);

  const kit = useMemo(
    () => ({ registerField, unregisterField, getLabel, getFieldId, requestSubmit }),
    [getFieldId, getLabel, registerField, requestSubmit, unregisterField],
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

  submitRef.current = () => {
    void form.handleSubmit(handleValid as Parameters<typeof form.handleSubmit>[0], handleInvalid)();
  };

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
  required = false,
  optional = false,
  maxLength,
  span = "auto",
  orientation = "vertical",
  children,
}: FormFieldProps<TValues>) {
  const { control, formState, watch } = useFormContext<TValues>();
  const watched = watch(name);
  const currentLength = typeof watched === "string" ? watched.length : 0;

  return (
    <div className={span === "full" ? "md:col-span-2" : undefined}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Field
            invalid={!!fieldState.error}
            disabled={formState.isSubmitting || disabled}
            orientation={orientation}
          >
            <FieldLabel>
              {label}
              {required ? (
                <span className="text-destructive" aria-hidden>
                  {" "}
                  *
                </span>
              ) : null}
              {optional ? (
                <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
              ) : null}
            </FieldLabel>
            <FormFieldControl
              name={String(name)}
              label={label}
              wireAria={wireAria}
              field={field}
              render={children}
            />
            {description || maxLength ? (
              <FieldDescription>
                {description}
                {maxLength ? (
                  <span className={description ? " ml-2 tabular-nums" : "tabular-nums"}>
                    {currentLength}/{maxLength}
                  </span>
                ) : null}
              </FieldDescription>
            ) : null}
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </div>
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

export function FormSection({
  title,
  description,
  children,
  action,
  columns = 1,
  surface = "plain",
}: FormSectionProps) {
  return (
    <section
      data-slot="form-section"
      data-surface={surface}
      className={
        surface === "card"
          ? "grid gap-4 rounded-xl border border-border bg-card p-4 md:p-6"
          : "grid gap-4"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="font-display text-2xl">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      <FieldGroup className={columns === 2 ? "md:grid md:grid-cols-2 md:gap-x-4" : undefined}>
        {children}
      </FieldGroup>
    </section>
  );
}

export function FormActions({
  submitLabel,
  hideSubmit = false,
  cancelHref,
  cancelLabel = "Cancel",
  className,
  children,
  guard: guardProp,
  formId,
  sticky = true,
  destructive,
}: FormActionsProps) {
  const { formState, requestSubmit } = useAdminFormContext();
  const ownedGuard = useUnsavedChangesGuard(formState.isDirty);
  const guard: UnsavedChangesGuard = guardProp ?? ownedGuard;

  return (
    <div
      data-slot="form-actions"
      className={[
        "flex flex-wrap items-center justify-end gap-2",
        sticky
          ? "max-md:sticky max-md:bottom-0 max-md:z-10 max-md:-mx-4 max-md:border-t max-md:border-border max-md:bg-background/95 max-md:p-4 max-md:backdrop-blur md:justify-end"
          : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {destructive ? <div className="mr-auto">{destructive}</div> : null}
      {children}
      {cancelHref ? (
        <Button type="button" variant="outline" onClick={() => guard.requestLeave(cancelHref)}>
          {cancelLabel}
        </Button>
      ) : null}
      {hideSubmit ? null : (
        <Button
          type="button"
          form={formId}
          loading={formState.isSubmitting}
          disabled={formState.isSubmitting}
          onClick={() => requestSubmit()}
        >
          {submitLabel}
        </Button>
      )}
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
