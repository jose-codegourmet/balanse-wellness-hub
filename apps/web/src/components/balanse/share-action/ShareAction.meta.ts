/**
 * # ShareAction (#343)
 *
 * Web-app wrapper around `@balanse/ui` `ShareButton` that routes its toasts to
 * the portal/public Jabkit toaster (`notify`). Use it everywhere `apps/web`
 * offers "Share": public session/event pages, booking detail "Invite friends",
 * calendar rows, class pages. Same props as `ShareButton` minus `notify`.
 *
 * Callers build `url` with `withShareParams` (`ref` + `src=customer` for a
 * signed-in customer, nothing for guests) and pass `posterUrl` pointing at
 * `/share/poster/...` with the same params. Hide `posterUrl` for cancelled or
 * past pages (link stays shareable; poster download does not).
 */
export const shareActionMeta = {
  purpose: "Share link / QR / poster button for apps/web, wired to the app toaster.",
  whenToUse: "Any apps/web surface that shares a public session or event page.",
  whenNotToUse: "apps/admin (wire ShareButton to the admin notify there) or portal-only URLs.",
} as const;
