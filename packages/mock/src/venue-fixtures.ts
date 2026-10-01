import type { AdminVenue } from "@balanse/domain";

/** Default branch. Every session without an explicit venue runs here. */
export const MAIN_STUDIO_VENUE_ID = "venue-main-studio";

export const venueFixtures: AdminVenue[] = [
  {
    id: MAIN_STUDIO_VENUE_ID,
    name: "Balansé Studio",
    address: "Unit 2A, Capitol Centrum Building, N Escario, Cebu City, 6000",
    kind: "BRANCH",
    openingHours: "Mon–Sat · 6:00 AM–9:00 PM",
    studioOwned: true,
    active: true,
    notes: "Main studio.",
  },
  {
    id: "venue-mandani-bay",
    name: "Mandani Bay — Garden Area",
    address: "Mandani Bay, Mandaue City, Cebu",
    kind: "OFFSITE",
    openingHours: "By confirmed event booking",
    studioOwned: false,
    active: true,
    notes: "Partner venue for outdoor events. Confirm the garden booking with the property.",
  },
  {
    id: "venue-mactan-beach-resort",
    name: "Mactan Beach Resort (placeholder)",
    address: "Lapu-Lapu City, Cebu",
    kind: "OFFSITE",
    openingHours: "Daily · 7:00 AM–8:00 PM",
    studioOwned: false,
    active: true,
    notes: "Placeholder resort partner for mock data.",
  },
  {
    id: "venue-it-park-popup",
    name: "IT Park Pop-up",
    address: "Cebu IT Park, Lahug, Cebu City",
    kind: "OFFSITE",
    openingHours: "",
    studioOwned: false,
    active: false,
    notes: "Past pop-up. Kept for session history.",
  },
];
