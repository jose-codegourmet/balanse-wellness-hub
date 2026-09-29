import type { AdminVenue } from "@balanse/domain";
import type { VenueFormValues } from "./VenueFormDialog.schema";

export const venueFormDefaultValues: VenueFormValues = {
  name: "",
  kind: "OFFSITE",
  address: "",
  notes: "",
  active: true,
};

export function venueFormValuesFromVenue(venue: AdminVenue): VenueFormValues {
  return {
    name: venue.name,
    kind: venue.kind,
    address: venue.address,
    notes: venue.notes,
    active: venue.active,
  };
}
