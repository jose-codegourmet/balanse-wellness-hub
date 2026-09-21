"use client";

import type { AdminSettings } from "@balanse/domain";
import { Button } from "@balanse/ui";
import Link from "next/link";
import { useUpdateAdminSettings } from "@/lib/query/mutations";
import { notify } from "@/modules/notifications/notify";
import { AdminForm, FormActions, FormField, FormSection } from "../forms/AdminForm";
import { PhPhoneBinding, TextBinding } from "../forms/bindings";
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
        description="GCash account details shown when a guest pays online. Manage receive QRs on the Payment QR page."
        columns={2}
        surface="card"
        action={
          <Button nativeButton={false} variant="outline" render={<Link href="/payment-qr" />}>
            Manage payment QRs
          </Button>
        }
      >
        <FormField name="gcashName" label="GCash name">
          {(field) => <TextBinding {...field} />}
        </FormField>
        <FormField
          name="gcashNumber"
          label="GCash number"
          description="Philippine mobile (09XX XXX XXXX)."
        >
          {(field) => <PhPhoneBinding {...field} />}
        </FormField>
      </FormSection>
      <FormActions submitLabel="Save payment info" />
    </AdminForm>
  );
}
