"use client";

import type { BundleDefinition } from "@balanse/domain";
import { Button } from "@balanse/ui";
import { useGrantCustomerBundle } from "@/lib/query/mutations";
import { AdminForm, FormField } from "@/modules/admin/forms/admin-form/AdminForm";
import { BooleanBinding, ChoiceBinding, TextareaBinding } from "@/modules/admin/forms/bindings";
import { notify } from "@/modules/notifications/notify";
import { grantPackageFormDefaultValues } from "./GrantPackageForm.defaults";
import { type GrantPackageFormValues, grantPackageFormSchema } from "./GrantPackageForm.schema";

export function GrantPackageForm({
  customerId,
  bundles,
}: {
  customerId: string;
  bundles: BundleDefinition[];
}) {
  const grant = useGrantCustomerBundle();
  const published = bundles.filter((row) => row.status === "PUBLISHED");

  return (
    <AdminForm
      id="grant-package-form"
      className="mt-4"
      schema={grantPackageFormSchema}
      defaultValues={grantPackageFormDefaultValues}
      onSubmit={async (values: GrantPackageFormValues) => {
        try {
          await grant.mutateAsync({
            customerId,
            bundleId: values.bundleId,
            note: values.note,
            overrideLimit: values.overrideLimit,
          });
          notify.admin("bundle.granted");
        } catch {
          notify.admin("bundle.grant-failed");
        }
      }}
    >
      <FormField name="bundleId" label="Published package" required>
        {(field) => (
          <ChoiceBinding
            {...field}
            options={published.map((row) => ({
              value: row.id,
              label: `${row.name} · ${row.sessionCredits} sessions`,
            }))}
          />
        )}
      </FormField>
      <FormField name="note" label="Internal note" required>
        {(field) => <TextareaBinding {...field} rows={3} />}
      </FormField>
      <FormField
        name="overrideLimit"
        label="Override per-customer limit"
        description="Creates an auditable override when this customer already has the configured limit."
      >
        {(field) => <BooleanBinding {...field} />}
      </FormField>
      <Button type="submit" className="mt-4" disabled={grant.isPending}>
        Grant package
      </Button>
    </AdminForm>
  );
}
