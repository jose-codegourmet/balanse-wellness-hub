import {
  BOOKING_CUTOFF_MINUTES_BEFORE_START,
  BOOKING_HOLD_DURATION_HOURS,
  CONTACT_DETAILS,
} from "@balanse/domain";
import { PrismaClient } from "@prisma/client";

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

const COACHES = [
  {
    id: "coach_rex",
    name: "Rex Francis Regis",
    specialties: ["Calisthenics", "Mat Pilates", "Caliyoga"],
  },
  {
    id: "coach_ephraim",
    name: "Ephraim Bacaltos",
    specialties: ["Circuit Training", "Groundworks", "Calisthenics"],
  },
  {
    id: "coach_rachelle",
    name: "Rachelle Tobiano",
    specialties: ["Kickboxing", "Brazilian Jiu-Jitsu"],
  },
  { id: "coach_alec", name: "Alec James Co", specialties: ["Calisthenics", "Circuit Training"] },
  { id: "coach_jodi", name: "Jodi Tio", specialties: ["Mat Pilates"] },
  { id: "coach_wolf", name: "Wolf", specialties: ["Yoga"] },
  { id: "coach_kate", name: "Kate Go", specialties: ["Yoga"] },
  { id: "coach_sofia", name: "Sofia Ocampo", specialties: ["Mat Pilates"] },
  { id: "coach_mikaela", name: "Mikaela Danielle", specialties: ["Dance Fitness"] },
  { id: "coach_maris", name: "Maris Cabrera", specialties: ["Dance Fitness"] },
  { id: "coach_francis", name: "Francis Acido", specialties: ["Dance Fitness"] },
] as const;

const CLASSES = [
  { id: "class_yoga", name: "Yoga" },
  { id: "class_mat_pilates", name: "Mat Pilates" },
  { id: "class_calisthenics", name: "Calisthenics" },
  { id: "class_caliyoga", name: "Caliyoga" },
  { id: "class_circuit", name: "Circuit Training" },
  { id: "class_kickboxing", name: "Kickboxing" },
  { id: "class_bjj", name: "Brazilian Jiu-Jitsu" },
  { id: "class_groundworks", name: "Groundworks" },
  { id: "class_dance", name: "Dance Fitness" },
  { id: "class_contemporary", name: "Contemporary" },
  { id: "class_groove", name: "Groove" },
  { id: "class_femme", name: "Femme" },
  { id: "class_kids", name: "Kids Classes" },
] as const;

/** Observed Cebu slots from Facebook findings §3, week starting Monday 14 Sep 2026. */
const WEEK_START = "2026-09-14";

type Slot = { time: string; classId: string; coachId: string };

const TIMETABLE: Record<number, Slot[]> = {
  0: [
    { time: "08:00", classId: "class_calisthenics", coachId: "coach_rex" },
    { time: "09:30", classId: "class_calisthenics", coachId: "coach_alec" },
    { time: "11:00", classId: "class_calisthenics", coachId: "coach_alec" },
    { time: "15:00", classId: "class_mat_pilates", coachId: "coach_rex" },
    { time: "16:30", classId: "class_circuit", coachId: "coach_ephraim" },
    { time: "18:00", classId: "class_groove", coachId: "coach_francis" },
    { time: "19:30", classId: "class_calisthenics", coachId: "coach_rex" },
  ],
  1: [
    { time: "08:00", classId: "class_mat_pilates", coachId: "coach_sofia" },
    { time: "09:30", classId: "class_bjj", coachId: "coach_rachelle" },
    { time: "11:00", classId: "class_kickboxing", coachId: "coach_rachelle" },
    { time: "15:00", classId: "class_yoga", coachId: "coach_wolf" },
    { time: "16:30", classId: "class_calisthenics", coachId: "coach_rex" },
    { time: "18:00", classId: "class_circuit", coachId: "coach_ephraim" },
    { time: "19:30", classId: "class_yoga", coachId: "coach_kate" },
  ],
  2: [
    { time: "08:00", classId: "class_mat_pilates", coachId: "coach_sofia" },
    { time: "09:30", classId: "class_calisthenics", coachId: "coach_rex" },
    { time: "11:00", classId: "class_groundworks", coachId: "coach_ephraim" },
    { time: "15:00", classId: "class_caliyoga", coachId: "coach_rex" },
    { time: "16:30", classId: "class_kickboxing", coachId: "coach_rachelle" },
    { time: "18:00", classId: "class_calisthenics", coachId: "coach_alec" },
    { time: "19:30", classId: "class_circuit", coachId: "coach_ephraim" },
  ],
  3: [
    { time: "08:00", classId: "class_caliyoga", coachId: "coach_rex" },
    { time: "09:30", classId: "class_kickboxing", coachId: "coach_rachelle" },
    { time: "11:00", classId: "class_kickboxing", coachId: "coach_rachelle" },
    { time: "16:30", classId: "class_groundworks", coachId: "coach_ephraim" },
    { time: "18:00", classId: "class_femme", coachId: "coach_maris" },
    { time: "19:30", classId: "class_calisthenics", coachId: "coach_rex" },
  ],
  4: [
    { time: "08:00", classId: "class_calisthenics", coachId: "coach_rex" },
    { time: "09:30", classId: "class_calisthenics", coachId: "coach_alec" },
    { time: "11:00", classId: "class_groundworks", coachId: "coach_ephraim" },
    { time: "15:00", classId: "class_yoga", coachId: "coach_wolf" },
    { time: "16:30", classId: "class_kickboxing", coachId: "coach_rachelle" },
    { time: "18:00", classId: "class_calisthenics", coachId: "coach_alec" },
    { time: "19:30", classId: "class_groundworks", coachId: "coach_ephraim" },
  ],
  5: [
    { time: "08:00", classId: "class_caliyoga", coachId: "coach_rex" },
    { time: "09:30", classId: "class_kickboxing", coachId: "coach_rachelle" },
    { time: "11:00", classId: "class_bjj", coachId: "coach_rachelle" },
    { time: "15:00", classId: "class_yoga", coachId: "coach_wolf" },
    { time: "16:30", classId: "class_calisthenics", coachId: "coach_alec" },
    { time: "18:00", classId: "class_mat_pilates", coachId: "coach_jodi" },
    { time: "19:30", classId: "class_circuit", coachId: "coach_ephraim" },
  ],
  6: [
    { time: "08:00", classId: "class_calisthenics", coachId: "coach_rex" },
    { time: "09:30", classId: "class_kickboxing", coachId: "coach_rachelle" },
    { time: "11:00", classId: "class_kickboxing", coachId: "coach_rachelle" },
    { time: "15:00", classId: "class_contemporary", coachId: "coach_mikaela" },
    { time: "16:30", classId: "class_mat_pilates", coachId: "coach_sofia" },
  ],
};

function manilaWallToUtc(dateYmd: string, hm: string): Date {
  return new Date(`${dateYmd}T${hm}:00+08:00`);
}

function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  assertSeedAllowed();

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
      },
    });
  }

  for (const klass of CLASSES) {
    await prisma.gymClass.upsert({
      where: { id: klass.id },
      create: {
        id: klass.id,
        name: klass.name,
        shortDescription: `PLACEHOLDER description for ${klass.name}.`,
        defaultDurationMinutes: 60,
        defaultCustomerPrice: PLACEHOLDER_PRICE,
        active: true,
        isPlaceholder: true,
      },
      update: {
        name: klass.name,
        defaultCustomerPrice: PLACEHOLDER_PRICE,
        isPlaceholder: true,
      },
    });
  }

  for (const coach of COACHES) {
    for (const spec of coach.specialties) {
      const klass = CLASSES.find((item) => item.name === spec);
      if (!klass) continue;
      await prisma.classCoach.upsert({
        where: { classId_coachId: { classId: klass.id, coachId: coach.id } },
        create: { classId: klass.id, coachId: coach.id },
        update: {},
      });
    }
  }

  const waiver = await prisma.policyDocument.upsert({
    where: { slug: "liability-waiver" },
    create: {
      id: "policy_waiver",
      kind: "WAIVER",
      slug: "liability-waiver",
      title: "Liability waiver (PLACEHOLDER)",
      required: true,
    },
    update: { title: "Liability waiver (PLACEHOLDER)", required: true },
  });
  const gymPolicy = await prisma.policyDocument.upsert({
    where: { slug: "gym-policy" },
    create: {
      id: "policy_gym",
      kind: "GYM_POLICY",
      slug: "gym-policy",
      title: "Gym policy (PLACEHOLDER)",
      required: true,
    },
    update: { required: true },
  });

  const placeholderBody =
    "PLACEHOLDER — not legal text. OQ-4: replace with Coach Rex production copy. Do not treat this as a waiver or policy.";

  for (const doc of [waiver, gymPolicy]) {
    await prisma.policyDocumentVersion.upsert({
      where: { documentId_version: { documentId: doc.id, version: "0.1.0-placeholder" } },
      create: {
        id: `${doc.id}_v010`,
        documentId: doc.id,
        version: "0.1.0-placeholder",
        title: `${doc.title} v0.1.0`,
        body: placeholderBody,
        effectiveFrom: new Date("2026-01-01T00:00:00+08:00"),
        isCurrent: true,
        isPlaceholder: true,
      },
      update: { body: placeholderBody, isCurrent: true, isPlaceholder: true },
    });
  }

  for (let day = 0; day < 7; day += 1) {
    const ymd = addDays(WEEK_START, day);
    for (const slot of TIMETABLE[day] ?? []) {
      const startsAt = manilaWallToUtc(ymd, slot.time);
      const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
      const id = `sess_${ymd}_${slot.time.replace(":", "")}_${slot.classId}`;
      await prisma.gymSession.upsert({
        where: { id },
        create: {
          id,
          classId: slot.classId,
          coachId: slot.coachId,
          startsAt,
          endsAt,
          capacity: 12,
          status: "PUBLISHED",
          customerPrice: PLACEHOLDER_PRICE,
          coachRate: PLACEHOLDER_RATE,
          coachRateType: "PER_SESSION",
          isPlaceholder: true,
        },
        update: {
          coachId: slot.coachId,
          startsAt,
          endsAt,
          customerPrice: PLACEHOLDER_PRICE,
          coachRate: PLACEHOLDER_RATE,
          isPlaceholder: true,
        },
      });
    }
  }

  await prisma.appMeta.upsert({
    where: { key: "public_settings" },
    create: {
      key: "public_settings",
      value: JSON.stringify({
        business: {
          name: "Balanse Wellness Hub",
          phone: CONTACT_DETAILS.phone,
          email: CONTACT_DETAILS.email,
          address: CONTACT_DETAILS.address,
          instagram: CONTACT_DETAILS.instagram,
          tiktok: CONTACT_DETAILS.tiktok,
          whatsapp: CONTACT_DETAILS.whatsapp,
          openingHours: "",
        },
        payment: {
          gcashAccountName: "",
          gcashNumber: "",
          gcashQrObjectKey: "",
          gcashQrPublicUrl: "",
        },
        content: { about: "", contact: "", faqs: [] },
      }),
    },
    update: {},
  });

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
