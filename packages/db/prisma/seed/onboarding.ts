import type {
  ExperienceLevel,
  FitnessGoal,
  HeardFromSource,
  PrismaClient,
  ReferralChannel,
} from "@prisma/client";
import { seedId } from "./ids";

type OnboardingFixture = {
  customerId: string;
  goals: FitnessGoal[];
  goalsOther: string;
  experienceLevel: ExperienceLevel | null;
  interestClassIds: string[];
  interestsOther: string;
  heardFrom: HeardFromSource | null;
  heardFromOther: string;
};

/** Thirteen answer sets cover completed and in-progress customer profiles. */
export const onboardingFixtures: readonly OnboardingFixture[] = [
  {
    customerId: "cust-ben",
    goals: ["STRENGTH", "COMMUNITY"],
    goalsOther: "",
    experienceLevel: "REGULAR",
    interestClassIds: ["class-calisthenics", "class-groundworks"],
    interestsOther: "",
    heardFrom: "FRIEND",
    heardFromOther: "",
  },
  {
    customerId: "cust-m-01",
    goals: ["FLEXIBILITY_MOBILITY", "STRESS_RELIEF"],
    goalsOther: "",
    experienceLevel: "SOME",
    interestClassIds: ["class-yoga", "class-pilates"],
    interestsOther: "",
    heardFrom: "INSTAGRAM",
    heardFromOther: "",
  },
  {
    customerId: "cust-m-02",
    goals: ["POSTURE_CORE"],
    goalsOther: "",
    experienceLevel: "NEW",
    interestClassIds: ["class-pilates"],
    interestsOther: "",
    heardFrom: "GOOGLE",
    heardFromOther: "",
  },
  {
    customerId: "cust-m-03",
    goals: ["ENDURANCE"],
    goalsOther: "",
    experienceLevel: "SOME",
    interestClassIds: ["class-circuit", "class-kickboxing"],
    interestsOther: "",
    heardFrom: null,
    heardFromOther: "",
  },
  {
    customerId: "cust-m-04",
    goals: ["STRENGTH", "POSTURE_CORE"],
    goalsOther: "",
    experienceLevel: "ADVANCED",
    interestClassIds: ["class-calisthenics", "class-bjj"],
    interestsOther: "",
    heardFrom: "FACEBOOK",
    heardFromOther: "",
  },
  {
    customerId: "cust-m-05",
    goals: ["WEIGHT_MANAGEMENT", "COMMUNITY"],
    goalsOther: "",
    experienceLevel: "REGULAR",
    interestClassIds: ["class-dance", "class-circuit"],
    interestsOther: "",
    heardFrom: "FRIEND",
    heardFromOther: "",
  },
  {
    customerId: "cust-m-06",
    goals: ["STRESS_RELIEF"],
    goalsOther: "",
    experienceLevel: "NEW",
    interestClassIds: ["class-yoga"],
    interestsOther: "",
    heardFrom: "WALK_IN",
    heardFromOther: "",
  },
  {
    customerId: "cust-m-07",
    goals: ["FLEXIBILITY_MOBILITY"],
    goalsOther: "",
    experienceLevel: "SOME",
    interestClassIds: ["class-caliyoga", "class-yoga"],
    interestsOther: "",
    heardFrom: "EVENT",
    heardFromOther: "",
  },
  {
    customerId: "cust-m-08",
    goals: ["COMMUNITY", "OTHER"],
    goalsOther: "Improve confidence in partner movement.",
    experienceLevel: "REGULAR",
    interestClassIds: ["class-bjj", "class-groundworks"],
    interestsOther: "",
    heardFrom: "FRIEND",
    heardFromOther: "",
  },
  {
    customerId: "cust-m-09",
    goals: ["ENDURANCE"],
    goalsOther: "",
    experienceLevel: "SOME",
    interestClassIds: ["class-dance"],
    interestsOther: "",
    heardFrom: "TIKTOK",
    heardFromOther: "",
  },
  {
    customerId: "cust-m-10",
    goals: ["POSTURE_CORE", "FLEXIBILITY_MOBILITY"],
    goalsOther: "",
    experienceLevel: "REGULAR",
    interestClassIds: ["class-pilates", "class-yoga"],
    interestsOther: "",
    heardFrom: "INSTAGRAM",
    heardFromOther: "",
  },
  {
    customerId: "cust-m-11",
    goals: ["STRENGTH"],
    goalsOther: "",
    experienceLevel: "ADVANCED",
    interestClassIds: ["class-calisthenics", "class-kickboxing"],
    interestsOther: "",
    heardFrom: "GOOGLE",
    heardFromOther: "",
  },
  {
    customerId: "cust-m-12",
    goals: ["OTHER"],
    goalsOther: "Build a consistent evening routine.",
    experienceLevel: "NEW",
    interestClassIds: ["class-contemporary"],
    interestsOther: "",
    heardFrom: null,
    heardFromOther: "",
  },
];

type ReferralFixture = {
  customerId: string;
  referredById: string;
  referralChannel: ReferralChannel;
};

/** Keep this in dependency order: Ben → M01 → M05 / M08 → their referrals. */
export const referralFixtures: readonly ReferralFixture[] = [
  { customerId: "cust-m-01", referredById: "cust-ben", referralChannel: "CUSTOMER_LINK" },
  { customerId: "cust-m-05", referredById: "cust-m-01", referralChannel: "CUSTOMER_QR" },
  { customerId: "cust-m-08", referredById: "cust-m-01", referralChannel: "CUSTOMER_LINK" },
  { customerId: "cust-m-10", referredById: "cust-m-05", referralChannel: "CUSTOMER_QR" },
  { customerId: "cust-m-12", referredById: "cust-m-08", referralChannel: "CUSTOMER_LINK" },
];

/** Customer signup dates drive onboarding and marketing reporting examples. */
export const signupDates: Readonly<Record<string, string>> = {
  "cust-ana": "2026-08-30T02:00:00.000Z",
  "cust-ben": "2026-08-31T02:00:00.000Z",
  "cust-empty": "2026-09-01T02:00:00.000Z",
  "cust-m-01": "2026-09-02T02:00:00.000Z",
  "cust-m-02": "2026-09-03T02:00:00.000Z",
  "cust-m-03": "2026-09-04T02:00:00.000Z",
  "cust-m-04": "2026-09-05T02:00:00.000Z",
  "cust-m-05": "2026-09-06T02:00:00.000Z",
  "cust-m-06": "2026-09-07T02:00:00.000Z",
  "cust-m-07": "2026-09-08T02:00:00.000Z",
  "cust-m-08": "2026-09-09T02:00:00.000Z",
  "cust-m-09": "2026-09-10T02:00:00.000Z",
  "cust-m-10": "2026-09-11T02:00:00.000Z",
  "cust-m-11": "2026-09-12T02:00:00.000Z",
  "cust-m-12": "2026-09-13T02:00:00.000Z",
};

export async function seedOnboarding(prisma: PrismaClient): Promise<void> {
  for (const fixture of onboardingFixtures) {
    const profileId = seedId(fixture.customerId);
    await prisma.profileOnboarding.upsert({
      where: { profileId },
      create: {
        profileId,
        goals: fixture.goals,
        goalsOther: fixture.goalsOther,
        experienceLevel: fixture.experienceLevel,
        interestsOther: fixture.interestsOther,
        heardFrom: fixture.heardFrom,
        heardFromOther: fixture.heardFromOther,
      },
      update: {
        goals: fixture.goals,
        goalsOther: fixture.goalsOther,
        experienceLevel: fixture.experienceLevel,
        interestsOther: fixture.interestsOther,
        heardFrom: fixture.heardFrom,
        heardFromOther: fixture.heardFromOther,
      },
    });
    await prisma.profileClassInterest.deleteMany({ where: { profileId } });
    await prisma.profileClassInterest.createMany({
      data: fixture.interestClassIds.map((classId) => ({ profileId, classId })),
    });
  }

  for (const fixture of referralFixtures) {
    await prisma.profile.update({
      where: { id: seedId(fixture.customerId) },
      data: {
        referredById: seedId(fixture.referredById),
        referralChannel: fixture.referralChannel,
      },
    });
  }

  await Promise.all(
    Object.entries(signupDates).map(([customerId, createdAt]) =>
      prisma.profile.update({
        where: { id: seedId(customerId) },
        data: { createdAt: new Date(createdAt) },
      }),
    ),
  );
}
