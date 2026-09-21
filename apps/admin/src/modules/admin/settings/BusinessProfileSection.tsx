"use client";

import type { AdminSettings } from "@balanse/domain";
import { useUpdateAdminSettings } from "@/lib/query/mutations";
import { notify } from "@/modules/notifications/notify";
import { AdminForm, FormActions, FormField, FormSection } from "../forms/AdminForm";
import { PhPhoneBinding, TextBinding } from "../forms/bindings";
import { businessProfileFormDefaultValues } from "../forms/settings/settings-form.defaults";
import {
  type BusinessProfileFormValues,
  businessProfileFormSchema,
} from "../forms/settings/settings-form.schema";
import { DirtyBridge } from "./DirtyBridge";

export function valuesFromBusinessSettings(settings: AdminSettings): BusinessProfileFormValues {
  return {
    businessName: settings.businessName,
    contact: {
      phone: settings.contact.phone,
      address: settings.contact.address,
    },
    openingHours: settings.openingHours,
  };
}

export function BusinessProfileSection({
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
  const defaultValues = empty
    ? businessProfileFormDefaultValues
    : valuesFromBusinessSettings(settings);

  return (
    <AdminForm
      id="settings-business-form"
      schema={businessProfileFormSchema}
      defaultValues={defaultValues}
      onSubmit={async (values) => {
        try {
          await update.mutateAsync({
            businessName: values.businessName,
            contact: {
              ...settings.contact,
              phone: values.contact.phone,
              address: values.contact.address,
            },
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
        title="Business profile"
        description="Operational studio details. These are not the public email shown on the site."
        columns={2}
        surface="card"
      >
        <FormField name="businessName" label="Business name">
          {(field) => <TextBinding {...field} />}
        </FormField>
        <FormField
          name="contact.phone"
          label="Operational phone"
          description="Philippine mobile for staff and bookings — not the public inbox."
        >
          {(field) => <PhPhoneBinding {...field} />}
        </FormField>
        <FormField name="contact.address" label="Studio address" span="full">
          {(field) => <TextBinding {...field} />}
        </FormField>
        <FormField
          name="openingHours"
          label="Opening hours"
          description="Left blank. Facebook did not expose daily hours."
          span="full"
        >
          {(field) => <TextBinding {...field} readOnly />}
        </FormField>
      </FormSection>
      <FormActions submitLabel="Save business profile" />
    </AdminForm>
  );
}
