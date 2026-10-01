/** Public pages a shared link lands on (`/sessions/...`, `/events/...`). */
export function isPublicShareReturn(path: string): boolean {
  const pathname = path.split(/[?#]/)[0] ?? "";
  return pathname.startsWith("/sessions/") || pathname.startsWith("/events/");
}
