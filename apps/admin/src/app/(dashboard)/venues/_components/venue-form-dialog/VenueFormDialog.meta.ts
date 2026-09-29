import type { AdminVenue } from "@balanse/domain";

export const venueFormDialogMeta = {
  purpose:
    "Create or edit a venue (a studio branch or an off-site partner place such as a resort) in a dialog over the venue list.",
  whenToUse:
    "Use on /venues for Add venue and the Edit row action. Gate the trigger on venues-manage. Writes go through useUpsertAdminVenue and getMockAdapter().",
  whenNotToUse:
    "Do not pick a session's venue here; that is the Venue field on the session form. Venues are never deleted: deactivate them so past sessions keep their place.",
} as const;

export type VenueFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit this venue. Omit or pass null to create one. */
  venue?: AdminVenue | null;
  onSaved?: (venue: AdminVenue) => void;
};
