"use client";

import { Button, FormPageSkeleton } from "@balanse/ui";
import { useQuery } from "@tanstack/react-query";
import { MapPinOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useUpsertAdminVenue } from "@/lib/query/mutations";
import { adminVenuesQuery } from "@/lib/query/queries";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
} from "@/modules/admin/forms/admin-form/AdminForm";
import {
  BooleanBinding,
  ChoiceBinding,
  TextareaBinding,
  TextBinding,
} from "@/modules/admin/forms/bindings";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { venueFormDefaultValues, venueFormValuesFromVenue } from "./VenueFormPage.defaults";
import type { VenueFormPageProps } from "./VenueFormPage.meta";
import { venueFormSchema } from "./VenueFormPage.schema";

export type { VenueFormPageProps } from "./VenueFormPage.meta";

const VENUES_CRUMB = { label: "Venues", href: "/venues" };

export function VenueFormPage({ venueId }: VenueFormPageProps) {
  const router = useRouter();
  const isNew = venueId === "new";
  const { principal } = useMockPrincipal();
  const venuesQuery = useQuery(adminVenuesQuery(principal));
  const upsert = useUpsertAdminVenue();
  const existing = isNew ? undefined : venuesQuery.data?.find((row) => row.id === venueId);

  if (!isNew && venuesQuery.isPending && !venuesQuery.data) {
    return (
      <AdminPageShell title="Edit venue" breadcrumb={[VENUES_CRUMB, { label: venueId }]}>
        <FormPageSkeleton label="Loading venue" sections={2} fields={7} />
      </AdminPageShell>
    );
  }

  if (!isNew && !existing) {
    return (
      <AdminPageShell
        title={venuesQuery.isError ? "Venue unavailable" : "Venue not found"}
        breadcrumb={[VENUES_CRUMB]}
      >
        <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          <MapPinOff aria-hidden="true" className="size-6" />
          <p>
            {venuesQuery.isError
              ? "We couldn’t load this venue. Please try again."
              : "This venue could not be found."}
          </p>
          {venuesQuery.isError ? (
            <Button variant="outline" onClick={() => void venuesQuery.refetch()}>
              Try again
            </Button>
          ) : null}
          <Link href="/venues" className="underline underline-offset-4">
            Back to venues
          </Link>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      eyebrow="Studio"
      title={isNew ? "Add venue" : (existing?.name ?? "Edit venue")}
      description="A branch is a studio you run. An off-site venue is a partner place, like a resort, where a session can run while the studio keeps its normal schedule."
      breadcrumb={[VENUES_CRUMB, { label: isNew ? "Add venue" : (existing?.name ?? venueId) }]}
    >
      <AdminForm
        key={existing?.id ?? "new"}
        id="venue-form"
        schema={venueFormSchema}
        defaultValues={existing ? venueFormValuesFromVenue(existing) : venueFormDefaultValues}
        onSubmit={async (values) => {
          try {
            const { operation, ...venueValues } = values;
            await upsert.mutateAsync({
              id: existing?.id,
              ...venueValues,
              studioOwned: operation === "STUDIO_OWNED",
            });
            notify.admin("venue.saved");
            router.push("/venues");
          } catch (error) {
            notify.admin("venue.save-failed");
            throw error;
          }
        }}
      >
        <FormSection
          title="Location"
          description="Where the venue is and when staff can rely on it being open."
          surface="card"
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
            name="openingHours"
            label="Opening hours"
            optional
            maxLength={240}
            description="Use the hours staff should rely on when scheduling at this venue."
          >
            {(field) => <TextBinding {...field} placeholder="Mon–Sat · 6:00 AM–9:00 PM" />}
          </FormField>
        </FormSection>

        <FormSection
          title="Operation"
          description="Who runs the location, what staff should know, and whether it can be picked for new sessions."
          surface="card"
        >
          <FormField
            name="operation"
            label="Venue operation"
            description="Clarifies whether the studio operates this location or books it from another party."
          >
            {(field) => (
              <ChoiceBinding
                {...field}
                as="radio"
                options={[
                  { value: "STUDIO_OWNED", label: "Studio-owned — we operate this location" },
                  {
                    value: "THIRD_PARTY",
                    label: "Third-party / rented — booked from another party",
                  },
                ]}
              />
            )}
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
        </FormSection>

        <FormActions submitLabel={isNew ? "Add venue" : "Save venue"} cancelHref="/venues" />
      </AdminForm>
    </AdminPageShell>
  );
}
