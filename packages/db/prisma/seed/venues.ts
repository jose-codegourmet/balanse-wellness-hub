import type { PrismaClient } from "@prisma/client";

/** Stable id shared with the venues migration. Every seeded session runs here. */
export const MAIN_STUDIO_VENUE_ID = "venue-main-studio";

type VenueSeed = {
  id: string;
  name: string;
  address: string;
  kind: "BRANCH" | "OFFSITE";
  openingHours: string;
  studioOwned: boolean;
  active: boolean;
  notes: string;
};

/** Mirrors `packages/mock/src/venue-fixtures.ts` (WIRE-0705, #360) — kept in sync by hand. */
const VENUES: readonly VenueSeed[] = [
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

export async function seedVenues(prisma: PrismaClient): Promise<void> {
  for (const venue of VENUES) {
    await prisma.venue.upsert({
      where: { id: venue.id },
      create: venue,
      update: {
        name: venue.name,
        address: venue.address,
        kind: venue.kind,
        openingHours: venue.openingHours,
        studioOwned: venue.studioOwned,
        active: venue.active,
        notes: venue.notes,
      },
    });
  }
}
