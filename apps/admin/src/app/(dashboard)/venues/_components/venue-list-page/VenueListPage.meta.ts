export const venueListPageMeta = {
  purpose:
    "List studio branches and off-site partner venues with their staff opening hours, operating model, and upcoming session counts; link to add or edit them and deactivate them in place.",
  whenToUse:
    "Route /venues (Directory nav). Readable with classes.read; the Add venue link, the Edit row action, and deactivate need venues-manage (classes.manage). Add and edit happen on /venues/new and /venues/[venueId] (VenueFormPage). Data comes from getMockAdapter() through the admin query layer.",
  whenNotToUse:
    "Do not assign sessions to venues here; that happens on the session form. Venues are never deleted, only deactivated.",
} as const;

export type VenueListPageProps = {
  /** Story-only. Renders the empty state. */
  empty?: boolean;
};
