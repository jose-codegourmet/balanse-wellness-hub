const DEFAULT_WEB_ORIGIN = "http://localhost:9000";

/**
 * Public origin of `apps/web`, used by admin to build share links to public
 * session and event pages (#347). Reads `NEXT_PUBLIC_WEB_SITE_URL` (inlined at
 * build time, so safe in client components) and trims trailing slashes.
 * Admin's own `NEXT_PUBLIC_SITE_URL` is its Auth origin (`:9001`), not this.
 */
export function getWebOrigin(): string {
  const value = process.env.NEXT_PUBLIC_WEB_SITE_URL?.trim();
  return (value || DEFAULT_WEB_ORIGIN).replace(/\/+$/, "");
}
