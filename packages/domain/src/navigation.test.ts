import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_ITEMS,
  CUSTOMER_NAV_ITEMS,
  isAdminNavActive,
  isCustomerNavActive,
  isPublicNavActive,
  PUBLIC_NAV_ITEMS,
  publicAuthItem,
} from "./navigation";

describe("FE-SHR-001 navigation catalogs", () => {
  it("keeps the public set in spec order with Schedule/Classes on the landing calendar", () => {
    expect(PUBLIC_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Schedule",
      "Classes",
      "Coaches",
      "About",
      "FAQs",
      "Contact",
      "Login/Profile",
    ]);
    expect(PUBLIC_NAV_ITEMS[0]?.href).toBe("/#schedule");
    expect(PUBLIC_NAV_ITEMS[1]?.href).toBe("/#classes");
  });

  it("keeps the customer set as four items with a combined Home/My Bookings destination", () => {
    expect(CUSTOMER_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Home/My Bookings",
      "Schedule",
      "Profile",
      "Achievements (TBD)",
    ]);
    expect(CUSTOMER_NAV_ITEMS).toHaveLength(4);
  });

  it("keeps the admin set at 12 items with Reports between Classes and Staff", () => {
    expect(ADMIN_NAV_ITEMS.map((item) => item.label)).toEqual([
      "Dashboard",
      "Schedule",
      "Bookings",
      "Payments",
      "Cancellations",
      "Reschedules",
      "Customers",
      "Coaches",
      "Classes",
      "Reports",
      "Staff",
      "Settings",
    ]);
    expect(ADMIN_NAV_ITEMS).toHaveLength(12);
  });

  it("does not leak admin-only destinations into public or customer catalogs", () => {
    const publicAndCustomer = [...PUBLIC_NAV_ITEMS, ...CUSTOMER_NAV_ITEMS].map((item) => item.href);
    expect(publicAndCustomer).not.toContain("/dashboard");
    expect(publicAndCustomer).not.toContain("/reports");
    expect(publicAndCustomer).not.toContain("/staff");
    expect(publicAndCustomer).not.toContain("/payments");
    expect(ADMIN_NAV_ITEMS.every((item) => !item.href.startsWith("/portal"))).toBe(true);
    expect(ADMIN_NAV_ITEMS.every((item) => !item.href.startsWith("/#"))).toBe(true);
  });

  it("marks nested admin and customer routes active without lighting sibling items", () => {
    expect(isAdminNavActive(ADMIN_NAV_ITEMS[2], "/bookings/abc")).toBe(true);
    expect(isCustomerNavActive(CUSTOMER_NAV_ITEMS[0], "/portal/bookings/new")).toBe(true);
    expect(isCustomerNavActive(CUSTOMER_NAV_ITEMS[0], "/portal/book/session-wed-open")).toBe(true);
    expect(isCustomerNavActive(CUSTOMER_NAV_ITEMS[0], "/portal/schedule")).toBe(false);
    expect(isCustomerNavActive(CUSTOMER_NAV_ITEMS[1], "/portal/schedule")).toBe(true);
    expect(isPublicNavActive(PUBLIC_NAV_ITEMS[0], "/", "")).toBe(true);
    expect(isPublicNavActive(PUBLIC_NAV_ITEMS[1], "/", "#classes")).toBe(true);
    expect(isPublicNavActive(PUBLIC_NAV_ITEMS[0], "/", "#classes")).toBe(false);
    expect(publicAuthItem("guest").label).toBe("Login");
    expect(publicAuthItem("customer").label).toBe("Profile");
  });
});
