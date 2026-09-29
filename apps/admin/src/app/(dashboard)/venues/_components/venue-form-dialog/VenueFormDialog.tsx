"use client";

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@balanse/ui";
import { useUpsertAdminVenue } from "@/lib/query/mutations";
import { AdminForm, FormActions, FormField } from "@/modules/admin/forms/admin-form/AdminForm";
import {
  BooleanBinding,
  ChoiceBinding,
  TextareaBinding,
  TextBinding,
} from "@/modules/admin/forms/bindings";
import { notify } from "@/modules/notifications/notify";
import { venueFormDefaultValues, venueFormValuesFromVenue } from "./VenueFormDialog.defaults";
import type { VenueFormDialogProps } from "./VenueFormDialog.meta";
import { venueFormSchema } from "./VenueFormDialog.schema";

const FORM_ID = "venue-form";

export function VenueFormDialog({ open, onOpenChange, venue, onSaved }: VenueFormDialogProps) {
  const upsert = useUpsertAdminVenue();
  const editing = Boolean(venue);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${venue?.name}` : "Add venue"}</DialogTitle>
          <DialogDescription>
            A branch is a studio you run. An off-site venue is a partner place, like a resort, where
            a session can run while the studio keeps its normal schedule.
          </DialogDescription>
        </DialogHeader>
        <AdminForm
          id={FORM_ID}
          key={venue?.id ?? "new"}
          schema={venueFormSchema}
          defaultValues={venue ? venueFormValuesFromVenue(venue) : venueFormDefaultValues}
          onSubmit={async (values) => {
            try {
              const saved = await upsert.mutateAsync({ id: venue?.id, ...values });
              notify.admin("venue.saved");
              onSaved?.(saved);
              onOpenChange(false);
            } catch (error) {
              notify.admin("venue.save-failed");
              throw error;
            }
          }}
        >
          <FormField name="name" label="Name" required maxLength={120}>
            {(field) => <TextBinding {...field} placeholder="Mactan Beach Resort" />}
          </FormField>
          <FormField name="kind" label="Type">
            {(field) => (
              <ChoiceBinding
                {...field}
                as="radio"
                options={[
                  { value: "BRANCH", label: "Branch — a studio you run" },
                  { value: "OFFSITE", label: "Off-site — a partner or one-off place" },
                ]}
              />
            )}
          </FormField>
          <FormField name="address" label="Address" optional maxLength={240}>
            {(field) => <TextBinding {...field} placeholder="Lapu-Lapu City, Cebu" />}
          </FormField>
          <FormField
            name="notes"
            label="Staff notes"
            optional
            maxLength={1000}
            description="Contacts, access, or booking reminders. Customers never see this."
          >
            {(field) => <TextareaBinding {...field} rows={3} />}
          </FormField>
          <FormField
            name="active"
            label="Active"
            orientation="horizontal"
            description="Inactive venues stay on past sessions but can't be picked for new ones."
          >
            {(field) => <BooleanBinding {...field} as="switch" />}
          </FormField>
          <FormActions
            formId={FORM_ID}
            submitLabel={editing ? "Save venue" : "Add venue"}
            sticky={false}
          >
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          </FormActions>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}
