import type { AdminVenue } from "@balanse/domain";
import type { VenueFormValues } from "./VenueFormPage.schema";

export const venueFormDefaultValues: VenueFormValues = {
  name: "",
  kind: "OFFSITE",
  address: "",
  openingHours: "",
  operation: "THIRD_PARTY",
  notes: "",
  active: true,
};

export function venueFormValuesFromVenue(venue: AdminVenue): VenueFormValues {
  return {
    name: venue.name,
    kind: venue.kind,
    address: venue.address,
    openingHours: venue.openingHours ?? "",
    operation: venue.studioOwned === true ? "STUDIO_OWNED" : "THIRD_PARTY",
    notes: venue.notes,
    active: venue.active,
  };
}
