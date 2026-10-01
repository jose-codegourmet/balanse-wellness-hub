/**
 * Public web origin for absolute share links (#343). Client-safe: reads the
 * build-time `NEXT_PUBLIC_SITE_URL`, falling back to the local dev origin so
 * server and client render the same string.
 */
export function publicSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:9000").replace(/\/+$/, "");
}
