/**
 * # PublicShareAction (#350)
 *
 * Admin "Share" (copy link / QR / PNG / poster) + "Open public page" for a
 * session or event. Links point at the web origin (`getWebOrigin()`,
 * `NEXT_PUBLIC_WEB_SITE_URL`) and carry `src=studio`; QR adds `via=qr`, so
 * sign-ups attribute to STUDIO_LINK / STUDIO_QR.
 *
 * Build the target with `sessionShareTarget(session, classSlug, venueName)` or
 * `eventShareTarget(event)`. Disabled reasons:
 * - session DRAFT → "Publish the session to share it"
 * - event DRAFT → "Publish the event to share it"
 * - event ARCHIVED → "Archived events can't be shared"
 * Cancelled sessions/events stay shareable (the page explains the
 * cancellation) but get no poster.
 *
 * Any staff who can see the host screen can share — sharing is not privileged.
 */
export type PublicShareTarget = {
  /** Public path on the web app, e.g. `/sessions/yoga/2026-09-19/session-x`. */
  path: string;
  title: string;
  subtitle: string;
  /** `/share/poster/...` on the web app, or null to hide the poster download. */
  posterPath: string | null;
  fileSlug: string;
  disabledReason?: string;
};

export type PublicShareActionProps = {
  target: PublicShareTarget;
  showOpenLink?: boolean;
  size?: "sm" | "default";
  label?: string;
  className?: string;
};

export const publicShareActionMeta = {
  purpose: "Admin share link/QR/poster for public session and event pages (src=studio).",
  whenToUse: "Schedule selected-session panel, session roster header, event detail.",
  whenNotToUse: "apps/web (use ShareAction there) or private/portal URLs.",
} as const;
