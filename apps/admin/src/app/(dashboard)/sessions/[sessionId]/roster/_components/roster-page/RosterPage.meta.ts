export const rosterPageMeta = {
  purpose:
    "Session roster and attendance for one scheduled class. Coach-role staff may open assigned sessions only.",
  whenToUse: "Admin /sessions/[sessionId]/roster.",
  whenNotToUse: "Do not use for global bookings, customer directory, or financial reports.",
  layout:
    "AdminPageShell header (session name, date, time) with compact stats (checked in / confirmed, places left, held, waitlist) and a capacity bar. Below: a Coaches row of photo circles with a shield mark, then Participants — search, count chips (All, To check in, Checked in, Held, Waitlist, No-show) and one auto-fill avatar grid with the guest's name and short status under each face; no-shows are struck through, waitlist faces carry their FIFO position.",
  identity:
    "#353: every face (all groups) uses UserAvatar (photo or initials) with the full name and the nickname as a muted italic subtitle; search matches name and nickname. Customers who opted out of the public roster (showOnPublicRoster = false) carry an eye-off mark on the tile and a 'Hidden on public roster' badge in the sheet. The guest sheet shows a compact goals / experience chip row with an expandable Interests / Other (shared CustomerAboutCard, variant compact) when `people[customerId].onboarding` is present — the adapter nulls it unless the viewer has customers.read or is the coach assigned to the session. The tile stays name + status only (the 5.5rem grid cell has no room for chips).",
  actions:
    "Tap a guest to open a bottom sheet with the full status, payment (when the actor may read payments), booking and customer links (when permitted), and — for CONFIRMED guests with the attendance action — Check in (one tap) and No-show (confirm, no refund). Held and waitlisted guests have no attendance actions.",
} as const;

export type RosterGroup = "to_check_in" | "checked_in" | "held" | "waitlist" | "no_show";

export type RosterPageProps = {
  sessionId: string;
  /** Story-only. Opens the guest sheet for this booking on mount. */
  initialGuestId?: string | null;
};
