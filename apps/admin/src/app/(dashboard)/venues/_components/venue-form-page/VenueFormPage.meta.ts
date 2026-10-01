export const venueFormPageMeta = {
  purpose:
    "Create or edit a venue (a studio branch or an off-site partner place such as a resort) on its own page, including staff opening hours and whether the studio operates the location.",
  whenToUse:
    'Routes /venues/new and /venues/[venueId] (venueId "new" creates). Both need venues-manage (classes.manage). Reads the venues query, writes through useUpsertAdminVenue and getMockAdapter(), then returns to /venues.',
  whenNotToUse:
    "Do not pick a session's venue here; that is the Venue field on the session form. Activate and deactivate stay row actions on /venues; venues are never deleted. The ownership flag is mock-only until a backend field contract is approved.",
} as const;

export type VenueFormPageProps = {
  /** Venue to edit, or `"new"` to create one. */
  venueId: string;
};
