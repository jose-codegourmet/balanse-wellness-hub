/**
 * Nav catalogs from docs/screen-specs/shared/01-navigation.md (FE-SHR-001).
 * Apps compose these lists; they must stay item-for-item and in this order.
 */

export type PublicNavId =
  | "schedule"
  | "classes"
  | "packages"
  | "coaches"
  | "about"
  | "faqs"
  | "contact"
  | "auth";

export type CustomerNavId = "home" | "schedule" | "packages" | "profile" | "achievements";

/** Submenu under the Profile destination (FE-CUS-017). */
export type CustomerProfileSectionId = "basic" | "account" | "password" | "policies";

export type AdminNavId =
  | "dashboard"
  | "schedule"
  | "events"
  | "bookings"
  | "payments"
  | "payment-qr"
  | "cancellations"
  | "reschedules"
  | "customers"
  | "coaches"
  | "classes"
  | "bundles"
  | "reports"
  | "staff"
  | "settings";

export type PublicNavItem = {
  id: PublicNavId;
  label: string;
  href: string;
};

export type CustomerNavItem = {
  id: CustomerNavId;
  label: string;
  href: string;
};

export type AdminNavItem = {
  id: AdminNavId;
  label: string;
  href: string;
};

export type CustomerProfileSection = {
  id: CustomerProfileSectionId;
  label: string;
  href: string;
  /** Stable `data-section` selector carried over from the single-page profile. */
  dataSection: "profile" | "account" | "password" | "policy-history";
};

/** Public set. Classes have their own catalogue; Schedule opens the booking calendar. */
export const PUBLIC_NAV_ITEMS: readonly PublicNavItem[] = [
  { id: "schedule", label: "Schedule", href: "/#schedule" },
  { id: "classes", label: "Classes", href: "/classes" },
  { id: "packages", label: "Packages", href: "/packages" },
  { id: "coaches", label: "Coaches", href: "/coaches" },
  { id: "about", label: "About", href: "/about" },
  { id: "faqs", label: "FAQs", href: "/faqs" },
  { id: "contact", label: "Contact", href: "/contact" },
  { id: "auth", label: "Login/Profile", href: "/login" },
] as const;

/** Customer set. Home and My Bookings are one destination. */
export const CUSTOMER_NAV_ITEMS: readonly CustomerNavItem[] = [
  { id: "home", label: "Home/My Bookings", href: "/portal" },
  { id: "schedule", label: "Schedule", href: "/portal/schedule" },
  { id: "packages", label: "Packages", href: "/portal/packages" },
  { id: "profile", label: "Profile", href: "/portal/profile" },
  { id: "achievements", label: "Achievements (TBD)", href: "/portal/achievements" },
] as const;

/**
 * Profile settings submenu. Basic profile is the default landing section, and
 * policies & waivers stays a first-class destination because FE-CUS-005
 * requires the accepted-document history to remain reachable.
 */
export const CUSTOMER_PROFILE_SECTIONS: readonly CustomerProfileSection[] = [
  { id: "basic", label: "Basic profile", href: "/portal/profile", dataSection: "profile" },
  {
    id: "account",
    label: "Account settings",
    href: "/portal/profile/account",
    dataSection: "account",
  },
  {
    id: "password",
    label: "Password settings",
    href: "/portal/profile/password",
    dataSection: "password",
  },
  {
    id: "policies",
    label: "Policies & waivers",
    href: "/portal/profile/policies",
    dataSection: "policy-history",
  },
] as const;

/** Admin set in the prescribed order. Events follows Schedule; Reports stays between Bundles and Staff. */
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "schedule", label: "Schedule", href: "/schedule" },
  { id: "events", label: "Events", href: "/events" },
  { id: "bookings", label: "Bookings", href: "/bookings" },
  { id: "payments", label: "Payments", href: "/payments" },
  { id: "payment-qr", label: "Payment QR", href: "/payment-qr" },
  { id: "cancellations", label: "Cancellations", href: "/cancellations" },
  { id: "reschedules", label: "Reschedules", href: "/reschedules" },
  { id: "customers", label: "Customers", href: "/customers" },
  { id: "coaches", label: "Coaches", href: "/coaches" },
  { id: "classes", label: "Classes", href: "/classes" },
  { id: "bundles", label: "Bundles", href: "/bundles" },
  { id: "reports", label: "Reports", href: "/reports" },
  { id: "staff", label: "Staff", href: "/staff" },
  { id: "settings", label: "Settings", href: "/settings" },
] as const;

export function publicAuthItem(role: "guest" | "customer" | "admin"): PublicNavItem {
  if (role === "guest") {
    return { id: "auth", label: "Login", href: "/login" };
  }
  return { id: "auth", label: "Profile", href: "/portal/profile" };
}

export function isPublicNavActive(item: PublicNavItem, pathname: string, hash = ""): boolean {
  if (item.id === "schedule") {
    return pathname === "/" && hash !== "#classes";
  }
  if (item.id === "classes") {
    return (
      (pathname === "/" && hash === "#classes") ||
      pathname === "/classes" ||
      pathname.startsWith("/classes/")
    );
  }
  if (item.id === "packages") {
    return pathname === "/packages" || pathname.startsWith("/packages/");
  }
  if (item.id === "auth") {
    return pathname === "/login" || pathname.startsWith("/portal/profile");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function isCustomerNavActive(item: CustomerNavItem, pathname: string): boolean {
  if (item.id === "home") {
    return (
      pathname === "/portal" ||
      pathname.startsWith("/portal/bookings") ||
      pathname.startsWith("/portal/book/")
    );
  }
  if (item.id === "packages") {
    return pathname === "/portal/packages" || pathname.startsWith("/portal/packages/");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function isAdminNavActive(item: AdminNavItem, pathname: string): boolean {
  // Roster lives at `/sessions/:id/roster`, outside `/schedule`, so it highlights Schedule.
  if (item.id === "schedule" && /^\/sessions\/[^/]+\/roster(?:\/|$)/.test(pathname)) {
    return true;
  }
  // `/schedule/:sessionId/event` is the authoring form, nested like recurrence.
  // It highlights Schedule. `/events`, `/events/new`, and `/events/:eventId` highlight Events.
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Resolves a `/portal/profile/*` pathname to the submenu entry it belongs to. */
export function customerProfileSectionFromPath(pathname: string): CustomerProfileSection {
  const match = CUSTOMER_PROFILE_SECTIONS.find(
    (section) =>
      section.id !== "basic" &&
      (pathname === section.href || pathname.startsWith(`${section.href}/`)),
  );
  return match ?? CUSTOMER_PROFILE_SECTIONS[0];
}

export function customerProfileSection(id: CustomerProfileSectionId): CustomerProfileSection {
  const match = CUSTOMER_PROFILE_SECTIONS.find((section) => section.id === id);
  if (!match) throw new Error(`Unknown profile section: ${id}`);
  return match;
}
