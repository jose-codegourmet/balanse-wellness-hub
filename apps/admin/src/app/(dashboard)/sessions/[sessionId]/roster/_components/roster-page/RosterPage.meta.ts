export const rosterPageMeta = {
  purpose:
    "Session roster and attendance for one scheduled class. Coach-role staff may open assigned sessions only.",
  whenToUse: "Admin /sessions/[sessionId]/roster.",
  whenNotToUse: "Do not use for global bookings, customer directory, or financial reports.",
  layout:
    "Header stats (checked in / confirmed, places available, held, waitlisted) with a capacity bar; search + attendance filter; Attendance (confirmed, checked-in, completed, no-show), Held / pending, and FIFO Waitlist card lists.",
  actions:
    "Check in is one tap on CONFIRMED rows. No-show needs confirmation (no refund). Held rows have no attendance actions — resolve payment first. Every row links to its booking when the actor may read bookings.",
} as const;
