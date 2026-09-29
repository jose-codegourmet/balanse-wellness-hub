export const venueListPageMeta = {
  purpose:
    "List studio branches and off-site partner venues, with upcoming session counts, and add, edit, or deactivate them.",
  whenToUse:
    "Route /venues (Directory nav). Readable with classes.read; add, edit, and deactivate need venues-manage (classes.manage). Data comes from getMockAdapter() through the admin query layer.",
  whenNotToUse:
    "Do not assign sessions to venues here; that happens on the session form. Venues are never deleted, only deactivated.",
} as const;

export type VenueListPageProps = {
  /** Story-only. Renders the empty state. */
  empty?: boolean;
  /** Story-only. Opens the create dialog on mount. */
  previewCreate?: boolean;
};
