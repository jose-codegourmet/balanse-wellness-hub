import {
  BOOKING_CUTOFF_MINUTES_BEFORE_START,
  BOOKING_HOLD_DURATION_HOURS,
  classSlug,
} from "@balanse/domain";
import { PrismaClient } from "@prisma/client";
import { seedCanonicalRolesAndPermissions } from "./constants/staff-roles";
import { seedBookings } from "./seed/bookings";
import { seedBundles } from "./seed/bundles";
import { seedClassChanges } from "./seed/class-changes";
import { seedCustomers } from "./seed/customers";
import { seedOnboarding } from "./seed/onboarding";
import { seedPaymentAccounts } from "./seed/payment-accounts";
import { seedSessions } from "./seed/sessions";
import { seedSettings } from "./seed/settings";
import { seedStaff } from "./seed/staff";
import { seedVenues } from "./seed/venues";

const prisma = new PrismaClient();

const SHARED_PROJECT_REF = "xydundrayuusqizssgby";

function assertSeedAllowed(): void {
  if (process.env.BALANSE_ALLOW_DB_SEED !== "1") {
    throw new Error(
      "Refusing to seed. Set BALANSE_ALLOW_DB_SEED=1. Seed never runs automatically.",
    );
  }
  const url = process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "";
  if (url.includes(SHARED_PROJECT_REF) && process.env.BALANSE_ALLOW_SHARED_PROJECT_SEED !== "1") {
    throw new Error(
      `Refusing to seed shared project ${SHARED_PROJECT_REF}. Set BALANSE_ALLOW_SHARED_PROJECT_SEED=1 explicitly.`,
    );
  }
}

const PLACEHOLDER_PRICE = "999.00";
const PLACEHOLDER_RATE = "500.00";

/**
 * Seed coaches are teaching profiles only (`staffMemberId` stays null).
 * BE-055: `coach-rex` is the same human as mock `staff-rex` / photo slug
 * `rex-francis-regis`. Link after the staff account exists via
 * `POST /api/admin/staff/{id}/coach` — do not invent a staff row here
 * (staff requires `auth.users` + `profiles`).
 *
 * Ids match the catalogue import's hyphenated convention (WIRE-0601, #359),
 * so this upserts the 11 already-imported rows in place instead of creating
 * duplicates (unlike `GymClass`, `Coach.name` has no unique constraint, so a
 * mismatched id would silently double every row rather than error).
 *
 * `photoKey` is set only for the 8 coaches with an uploaded object under
 * `coach-photos/<slug>/` in storage (`packages/domain/src/asset-manifest.json`
 * `coach_slug`). `alec-james-co`, `kate-go`, and `sofia-ocampo` have manifest
 * slugs but no uploaded headshot yet — stay `null` until that upload lands;
 * do not point the DB at a storage object that does not exist.
 */
const COACHES = [
  {
    id: "coach-rex",
    name: "Rex Francis Regis",
    specialties: ["Calisthenics", "Mat Pilates", "Caliyoga"],
    photoKey: "coach-photos/rex-francis-regis",
  },
  {
    id: "coach-ephraim",
    name: "Ephraim Bacaltos",
    specialties: ["Circuit Training", "Groundworks", "Calisthenics"],
    photoKey: "coach-photos/ephraim-bacaltos",
  },
  {
    id: "coach-rachelle",
    name: "Rachelle Tobiano",
    specialties: ["Kickboxing", "Brazilian Jiu-Jitsu"],
    photoKey: "coach-photos/rachelle-tobiano",
  },
  {
    id: "coach-alec",
    name: "Alec James Co",
    specialties: ["Calisthenics", "Circuit Training"],
    photoKey: null,
  },
  {
    id: "coach-jodi",
    name: "Jodi Tio",
    specialties: ["Mat Pilates"],
    photoKey: "coach-photos/jodi-tio",
  },
  { id: "coach-wolf", name: "Wolf", specialties: ["Yoga"], photoKey: "coach-photos/wolf" },
  { id: "coach-kate", name: "Kate Go", specialties: ["Yoga"], photoKey: null },
  { id: "coach-sofia", name: "Sofia Ocampo", specialties: ["Mat Pilates"], photoKey: null },
  {
    id: "coach-mikaela",
    name: "Mikaela Danielle",
    specialties: ["Dance Fitness"],
    photoKey: "coach-photos/mikaela-danielle",
  },
  {
    id: "coach-maris",
    name: "Maris Cabrera",
    specialties: ["Dance Fitness"],
    photoKey: "coach-photos/maris-cabrera",
  },
  {
    id: "coach-francis",
    name: "Francis Acido",
    specialties: ["Dance Fitness"],
    photoKey: "coach-photos/francis-acido",
  },
] as const;

const CLASSES = [
  { id: "class-yoga", name: "Yoga" },
  { id: "class-pilates", name: "Mat Pilates" },
  { id: "class-calisthenics", name: "Calisthenics" },
  { id: "class-caliyoga", name: "Caliyoga" },
  { id: "class-circuit", name: "Circuit Training" },
  { id: "class-kickboxing", name: "Kickboxing" },
  { id: "class-bjj", name: "Brazilian Jiu-Jitsu" },
  { id: "class-groundworks", name: "Groundworks" },
  { id: "class-dance", name: "Dance Fitness" },
  { id: "class-contemporary", name: "Contemporary" },
  { id: "class-groove", name: "Groove" },
  { id: "class-femme", name: "Femme" },
  { id: "class-kids", name: "Kids Classes" },
] as const;

async function main(): Promise<void> {
  assertSeedAllowed();

  await seedCanonicalRolesAndPermissions(prisma);
  await seedCustomers(prisma);

  await prisma.developerConfig.upsert({
    where: { key: "BOOKING_HOLD_DURATION_HOURS" },
    create: { key: "BOOKING_HOLD_DURATION_HOURS", value: String(BOOKING_HOLD_DURATION_HOURS) },
    update: { value: String(BOOKING_HOLD_DURATION_HOURS) },
  });
  await prisma.developerConfig.upsert({
    where: { key: "BOOKING_CUTOFF_MINUTES_BEFORE_START" },
    create: {
      key: "BOOKING_CUTOFF_MINUTES_BEFORE_START",
      value: String(BOOKING_CUTOFF_MINUTES_BEFORE_START),
    },
    update: { value: String(BOOKING_CUTOFF_MINUTES_BEFORE_START) },
  });

  for (const coach of COACHES) {
    await prisma.coach.upsert({
      where: { id: coach.id },
      create: {
        id: coach.id,
        name: coach.name,
        specialties: [...coach.specialties],
        shortBio: "PLACEHOLDER bio — not owner-supplied.",
        photoKey: coach.photoKey,
        active: true,
        defaultRate: PLACEHOLDER_RATE,
        rateType: "PER_SESSION",
        isPlaceholder: true,
      },
      update: {
        name: coach.name,
        specialties: [...coach.specialties],
        defaultRate: PLACEHOLDER_RATE,
        isPlaceholder: true,
        // Only set a known-good manifest key; never clobber a real upload
        // (or a still-missing one) with this fixture's own null.
        ...(coach.photoKey ? { photoKey: coach.photoKey } : {}),
      },
    });
  }

  await seedStaff(prisma);

  for (const klass of CLASSES) {
    // Ids match the catalogue import's hyphenated convention (WIRE-0506, #358)
    // so this upserts the 9 already-imported rows in place instead of
    // duplicating them under a new id (name is @unique). `update` only
    // touches `name`/`isPlaceholder` — never price or duration — so re-seeding
    // never clobbers real values the import/admin editor already set.
    await prisma.gymClass.upsert({
      where: { id: klass.id },
      create: {
        id: klass.id,
        name: klass.name,
        slug: classSlug(klass.name),
        shortDescription: `PLACEHOLDER description for ${klass.name}.`,
        defaultDurationMinutes: 60,
        defaultCustomerPrice: PLACEHOLDER_PRICE,
        active: true,
        isPlaceholder: true,
      },
      update: {
        name: klass.name,
        isPlaceholder: true,
      },
    });
  }

  await seedVenues(prisma);
  await seedSessions(prisma);
  await seedClassChanges(prisma);

  await seedOnboarding(prisma);
  await seedBookings(prisma);
  await seedBundles(prisma);
  await seedPaymentAccounts(prisma);
  await seedSettings(prisma);

  await prisma.appMeta.upsert({
    where: { key: "schema_note" },
    create: {
      key: "schema_note",
      value: "BE-023 demo seed. Prices/rates are PLACEHOLDER 999/500 and not authoritative.",
    },
    update: {
      value: "BE-023 demo seed. Prices/rates are PLACEHOLDER 999/500 and not authoritative.",
    },
  });

  console.log("[ok] BE-023 seed applied (placeholder prices, Facebook §4b roster).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
