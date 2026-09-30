"use client";

import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
} from "@/modules/admin/forms/admin-form/AdminForm";
import { BooleanBinding } from "@/modules/admin/forms/bindings";
import { notify } from "@/modules/notifications/notify";
import { profilePreferencesFormDefaultValues } from "./ProfilePreferencesForm.defaults";
import type { ProfilePreferencesFormProps } from "./ProfilePreferencesForm.meta";
import {
  type ProfilePreferencesFormValues,
  profilePreferencesFormSchema,
} from "./ProfilePreferencesForm.schema";

export function ProfilePreferencesForm({
  defaultValues = profilePreferencesFormDefaultValues,
  onSaved,
}: ProfilePreferencesFormProps) {
  return (
    <AdminForm
      id="profile-preferences-form"
      schema={profilePreferencesFormSchema}
      defaultValues={defaultValues}
      onSubmit={(values) => {
        onSaved?.(values);
        notify.success({
          title: "Preferences saved",
          description: "Your notification preferences are updated for this mock session.",
        });
      }}
    >
      <FormSection
        title="Notification preferences"
        description="Choose which operational updates are relevant to your work."
        surface="card"
      >
        <FormField
          name="scheduleUpdates"
          label="Schedule updates"
          description="Receive updates when sessions you can access are changed or cancelled."
          orientation="responsive"
        >
          {(field) => <BooleanBinding {...field} as="switch" />}
        </FormField>
        <FormField
          name="dailySummary"
          label="Daily operations summary"
          description="Receive a concise start-of-day summary of the queues available to you."
          orientation="responsive"
        >
          {(field) => <BooleanBinding {...field} as="switch" />}
        </FormField>
        <FormField
          name="securityAlerts"
          label="Security alerts"
          description="Keep sign-in and account-access alerts enabled for this staff account."
          orientation="responsive"
        >
          {(field) => <BooleanBinding {...field} as="switch" />}
        </FormField>
      </FormSection>
      <FormActions sticky={false} submitLabel="Save preferences" />
    </AdminForm>
  );
}
