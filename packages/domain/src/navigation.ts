/**
 * Nav catalogs from docs/screen-specs/shared/01-navigation.md (FE-SHR-001).
 * Apps compose these lists; they must stay item-for-item and in this order.
 */

export type PublicNavId =
  | "schedule"
  | "classes"
  | "coaches"
  | "about"
  | "faqs"
  | "contact"
  | "auth";

export type CustomerNavId = "home" | "schedule" | "profile" | "achievements";

export type AdminNavId =
  | "dashboard"
  | "schedule"
  | "bookings"
  | "payments"
  | "cancellations"
  | "reschedules"
  | "customers"
  | "coaches"
  | "classes"
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

/** Public set. Schedule and Classes resolve to the landing calendar (OQ-NAV). */
export const PUBLIC_NAV_ITEMS: readonly PublicNavItem[] = [
  { id: "schedule", label: "Schedule", href: "/#schedule" },
  { id: "classes", label: "Classes", href: "/#classes" },
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
  { id: "profile", label: "Profile", href: "/portal/profile" },
  { id: "achievements", label: "Achievements (TBD)", href: "/portal/achievements" },
] as const;

/** Admin set in the prescribed order, Reports between Classes and Staff. */
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "schedule", label: "Schedule", href: "/schedule" },
  { id: "bookings", label: "Bookings", href: "/bookings" },
  { id: "payments", label: "Payments", href: "/payments" },
  { id: "cancellations", label: "Cancellations", href: "/cancellations" },
  { id: "reschedules", label: "Reschedules", href: "/reschedules" },
  { id: "customers", label: "Customers", href: "/customers" },
  { id: "coaches", label: "Coaches", href: "/coaches" },
  { id: "classes", label: "Classes", href: "/classes" },
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
    return pathname === "/" && hash === "#classes";
  }
  if (item.id === "auth") {
    return pathname === "/login" || pathname.startsWith("/portal/profile");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function isCustomerNavActive(item: CustomerNavItem, pathname: string): boolean {
  if (item.id === "home") {
    return pathname === "/portal" || pathname.startsWith("/portal/bookings");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function isAdminNavActive(item: AdminNavItem, pathname: string): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
