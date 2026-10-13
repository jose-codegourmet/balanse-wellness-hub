"use client";

import { PasswordInput } from "@balanse/ui";
import { AdminForm, FormActions, FormField } from "@/modules/admin/forms/admin-form/AdminForm";
import { staffPasswordFormDefaults } from "./StaffPasswordForm.defaults";
import type { StaffPasswordFormProps } from "./StaffPasswordForm.meta";
import { staffPasswordFormSchema } from "./StaffPasswordForm.schema";

export function StaffPasswordForm({ onSubmit }: StaffPasswordFormProps) {
  return (
    <AdminForm
      schema={staffPasswordFormSchema}
      defaultValues={staffPasswordFormDefaults}
      onSubmit={onSubmit}
    >
      <FormField
        name="password"
        label="New password"
        description="Use at least 8 characters."
        required
      >
        {(field) => (
          <PasswordInput
            name={field.name}
            ref={field.ref}
            autoComplete="new-password"
            value={String(field.value ?? "")}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(event.target.value)}
          />
        )}
      </FormField>
      <FormField name="confirmPassword" label="Confirm password" required>
        {(field) => (
          <PasswordInput
            name={field.name}
            ref={field.ref}
            autoComplete="new-password"
            value={String(field.value ?? "")}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(event.target.value)}
          />
        )}
      </FormField>
      <FormActions submitLabel="Set password" sticky={false} />
    </AdminForm>
  );
}
