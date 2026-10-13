"use client";

import { PasswordInput } from "@balanse/ui";
import { AdminForm, FormActions, FormField } from "@/modules/admin/forms/admin-form/AdminForm";
import { TextBinding } from "@/modules/admin/forms/bindings";
import { adminLoginFormDefaultValues } from "./AdminLoginForm.defaults";
import { type AdminLoginFormValues, adminLoginFormSchema } from "./AdminLoginForm.schema";

export function AdminLoginForm({
  onSubmit,
}: {
  onSubmit: (values: AdminLoginFormValues) => Promise<void>;
}) {
  return (
    <AdminForm
      schema={adminLoginFormSchema}
      defaultValues={adminLoginFormDefaultValues}
      onSubmit={onSubmit}
    >
      <FormField name="email" label="Email">
        {(field) => <TextBinding {...field} type="email" autoComplete="username" />}
      </FormField>
      <FormField name="password" label="Password">
        {(field) => (
          <PasswordInput
            name={field.name}
            ref={field.ref}
            autoComplete="current-password"
            value={field.value == null ? "" : String(field.value)}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(event.target.value)}
          />
        )}
      </FormField>
      <FormActions submitLabel="Log in" sticky={false} />
    </AdminForm>
  );
}
