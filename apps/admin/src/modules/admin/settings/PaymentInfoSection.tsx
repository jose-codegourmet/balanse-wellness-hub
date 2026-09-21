"use client";

import type { AdminSettings } from "@balanse/domain";
import { useUpdateAdminSettings } from "@/lib/query/mutations";
import { notify } from "@/modules/notifications/notify";
import { AdminForm, FormActions, FormField, FormSection } from "../forms/AdminForm";
import { ImageBinding, TextBinding } from "../forms/bindings";
import { paymentInfoFormDefaultValues } from "../forms/settings/settings-form.defaults";
import {
  type PaymentInfoFormValues,
  paymentInfoFormSchema,
} from "../forms/settings/settings-form.schema";
import { DirtyBridge } from "./DirtyBridge";

export function valuesFromPaymentSettings(settings: AdminSettings): PaymentInfoFormValues {
  return {
    gcashName: settings.gcashName,
    gcashNumber: settings.gcashNumber,
    qrImageKey: settings.qrImageKey,
  };
}

export function PaymentInfoSection({
  settings,
  empty = false,
  onDirtyChange,
  onSaved,
}: {
  settings: AdminSettings;
  empty?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  onSaved?: () => void;
}) {
  const update = useUpdateAdminSettings();
  const defaultValues = empty ? paymentInfoFormDefaultValues : valuesFromPaymentSettings(settings);

  return (
    <AdminForm
      id="settings-payment-form"
      schema={paymentInfoFormSchema}
      defaultValues={defaultValues}
      onSubmit={async (values) => {
        try {
          await update.mutateAsync({
            gcashName: values.gcashName,
            gcashNumber: values.gcashNumber,
            qrImageKey: values.qrImageKey,
          });
          notify.admin("settings.saved");
          onSaved?.();
        } catch (error) {
          notify.admin("settings.save-failed");
          throw error;
        }
      }}
    >
      <DirtyBridge onDirtyChange={onDirtyChange} />
      <FormSection
        title="Payment info"
        description="GCash details shown when a guest pays online. Saving here does not rewrite public content."
        columns={2}
        surface="card"
      >
        <FormField name="gcashName" label="GCash name">
          {(field) => <TextBinding {...field} />}
        </FormField>
        <FormField name="gcashNumber" label="GCash number">
          {(field) => <TextBinding {...field} type="tel" inputMode="tel" />}
        </FormField>
        <FormField name="qrImageKey" label="GCash QR" wireAria span="full">
          {(field) => (
            <ImageBinding
              {...field}
              label={field.value ? "Replace QR" : "Upload QR"}
              fallbackLabel="No QR uploaded yet."
              previewName="GCash QR"
            />
          )}
        </FormField>
      </FormSection>
      <FormActions submitLabel="Save payment info" />
    </AdminForm>
  );
}
