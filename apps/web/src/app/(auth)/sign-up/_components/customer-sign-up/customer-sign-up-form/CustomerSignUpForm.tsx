"use client";

import {
  Button,
  Field,
  FieldError,
  FieldLabel,
  Input,
  PasswordInput,
  PhPhoneInput,
} from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { customerSignUpFormDefaultValues } from "./CustomerSignUpForm.defaults";
import {
  type CustomerSignUpFormValues,
  customerSignUpFormSchema,
} from "./CustomerSignUpForm.schema";

export type CustomerSignUpFormProps = {
  /** Initial values. Remount (change `key`) to apply a new prefill such as Google. */
  defaultValues?: CustomerSignUpFormValues;
  onSubmit: (values: CustomerSignUpFormValues) => void | Promise<void>;
  submitting?: boolean;
  /** Form-level failure from the account action. */
  formError?: string | null;
  /** Rendered above the submit button, e.g. admin-attached policy acceptance. */
  beforeSubmit?: ReactNode;
  /** Called before validation results are applied; return false to block submit. */
  canSubmit?: () => boolean;
};

export function CustomerSignUpForm({
  defaultValues = customerSignUpFormDefaultValues,
  onSubmit,
  submitting = false,
  formError,
  beforeSubmit,
  canSubmit,
}: CustomerSignUpFormProps) {
  const form = useForm<CustomerSignUpFormValues>({
    resolver: zodResolver(customerSignUpFormSchema),
    defaultValues,
  });
  const { errors } = form.formState;
  const google = defaultValues.authMethod === "google";

  return (
    <form
      className="auth-form"
      noValidate
      aria-busy={submitting}
      onSubmit={(event) => {
        // Policies live outside the form; reveal their error alongside field errors.
        const allowed = canSubmit ? canSubmit() : true;
        void form.handleSubmit(async (values) => {
          if (!allowed) return;
          await onSubmit(values);
        })(event);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <Field className="auth-field" invalid={Boolean(errors.firstName)}>
          <FieldLabel>First name</FieldLabel>
          <Input autoComplete="given-name" {...form.register("firstName")} />
          <FieldError className="auth-error" errors={[errors.firstName]} />
        </Field>
        <Field className="auth-field" invalid={Boolean(errors.lastName)}>
          <FieldLabel>Last name</FieldLabel>
          <Input autoComplete="family-name" {...form.register("lastName")} />
          <FieldError className="auth-error" errors={[errors.lastName]} />
        </Field>
      </div>
      <Field className="auth-field" invalid={Boolean(errors.email)}>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" autoComplete="email" readOnly={google} {...form.register("email")} />
        <FieldError className="auth-error" errors={[errors.email]} />
      </Field>
      <Field className="auth-field" invalid={Boolean(errors.contactNumber)}>
        <FieldLabel>Contact number</FieldLabel>
        <Controller
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <PhPhoneInput
              name={field.name}
              ref={field.ref}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.target.value)}
              autoComplete="tel"
            />
          )}
        />
        <FieldError className="auth-error" errors={[errors.contactNumber]} />
      </Field>
      {google ? null : (
        <>
          <Field className="auth-field" invalid={Boolean(errors.password)}>
            <FieldLabel>Password</FieldLabel>
            <PasswordInput autoComplete="new-password" {...form.register("password")} />
            <FieldError className="auth-error" errors={[errors.password]} />
          </Field>
          <Field className="auth-field" invalid={Boolean(errors.confirmPassword)}>
            <FieldLabel>Confirm password</FieldLabel>
            <PasswordInput autoComplete="new-password" {...form.register("confirmPassword")} />
            <FieldError className="auth-error" errors={[errors.confirmPassword]} />
          </Field>
        </>
      )}
      {beforeSubmit}
      {formError ? (
        <p role="alert" className="auth-form-error">
          {formError}
        </p>
      ) : null}
      <Button type="submit" className="mt-1 w-full" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Creating account…
          </>
        ) : (
          <>
            Create account <ArrowUpRight className="size-4" aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
}
