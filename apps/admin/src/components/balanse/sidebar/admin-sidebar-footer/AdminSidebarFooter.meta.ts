import type * as React from "react";

/** Signed-in identity: private photo/initials, real name, role; email inside the account menu.
 * Refreshes display-only identity on a staff-scoped query before signed URLs expire.
 * Used by both desktop/collapsed and mobile navigation. */
export type AdminSidebarFooterProps = React.ComponentProps<"div"> & {
  collapsed?: boolean;
  /** Opens the signed-in staff member's own profile. */
  onProfile?: () => void;
  /** Permission-scoped studio, content, policy, and payment settings. */
  onStudioSettings?: () => void;
  onLogout?: () => void;
};
