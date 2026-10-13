/**
 * Web React Query keys (#356 WIRE-0105). Rooted at `["web", customerId ?? "guest"]`
 * so a guest's cache and a signed-in customer's cache never collide, and
 * signing out (customerId → null) can't serve a stale customer's data.
 * Extend this object per entity as screens adopt React Query — do not build
 * ad hoc key arrays at call sites.
 */
export const webKeys = {
  all: (customerId: string | null) => ["web", customerId ?? "guest"] as const,
  /** Public, viewer-independent catalogue data is not rooted under a customer id. */
  publicClasses: () => ["web", "public", "classes"] as const,
  publicCoaches: () => ["web", "public", "coaches"] as const,
  publicPackages: () => ["web", "public", "packages"] as const,
  me: {
    profile: (customerId: string | null) => [...webKeys.all(customerId), "me"] as const,
    policyAcceptances: (customerId: string | null) =>
      [...webKeys.all(customerId), "me", "policy-acceptances"] as const,
    onboarding: (customerId: string | null) =>
      [...webKeys.all(customerId), "me", "onboarding"] as const,
  },
  bookings: {
    all: (customerId: string | null) => [...webKeys.all(customerId), "bookings"] as const,
    list: (customerId: string | null) => [...webKeys.bookings.all(customerId), "list"] as const,
    detail: (customerId: string | null, id: string) =>
      [...webKeys.bookings.all(customerId), "detail", id] as const,
    eligiblePackages: (customerId: string | null, sessionId: string) =>
      [...webKeys.bookings.all(customerId), "eligible-packages", sessionId] as const,
  },
  packages: {
    all: (customerId: string | null) => [...webKeys.all(customerId), "packages"] as const,
    detail: (customerId: string | null, id: string) =>
      [...webKeys.packages.all(customerId), "detail", id] as const,
    redemptions: (customerId: string | null, id: string) =>
      [...webKeys.packages.detail(customerId, id), "redemptions"] as const,
  },
  publicPackage: (slug: string) => [...webKeys.publicPackages(), slug] as const,
  publicSession: (id: string) => ["web", "public", "session", id] as const,
  /** Response is viewer-personalized (counts for a guest, display rows for a signed-in viewer) — fine to cache per browser tab, cleared on sign-out like everything else under `webKeys`. */
  publicRoster: (id: string) => ["web", "public", "session", id, "roster"] as const,
  /** Prefix: `invalidateQueries({queryKey: webKeys.publicSessionsAll()})` matches every range. */
  publicSessionsAll: () => ["web", "public", "sessions"] as const,
  publicSessions: (from: string, to: string) => [...webKeys.publicSessionsAll(), from, to] as const,
} as const;
