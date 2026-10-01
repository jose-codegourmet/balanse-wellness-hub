import type {
  CustomerOnboardingAnswers,
  CustomerProfile,
  OnboardingStatus,
  ReferralChannel,
} from "@balanse/domain";
import { joinFullName } from "@balanse/domain";

/**
 * #343 community fixtures: members with nicknames, abstract placeholder
 * avatars (never photos of real people), roster opt-outs, onboarding states,
 * and referral links. Used by the public roster, profile, onboarding, admin
 * customer, Coach Students, and marketing insights screens.
 */

export const MOCK_AVATAR_URLS = [
  "/assets/placeholders/avatars/avatar-01.svg",
  "/assets/placeholders/avatars/avatar-02.svg",
  "/assets/placeholders/avatars/avatar-03.svg",
  "/assets/placeholders/avatars/avatar-04.svg",
  "/assets/placeholders/avatars/avatar-05.svg",
  "/assets/placeholders/avatars/avatar-06.svg",
] as const;

function avatar(index: number): string {
  return MOCK_AVATAR_URLS[(index - 1) % MOCK_AVATAR_URLS.length] ?? MOCK_AVATAR_URLS[0];
}

type MemberSeed = {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  avatar?: number | null;
  email: string;
  contactNumber: string;
  authMethod?: "email" | "google";
  showOnPublicRoster?: boolean;
  referralCode: string;
  onboardingStatus: OnboardingStatus;
};

export function memberProfile(seed: MemberSeed): CustomerProfile {
  return {
    id: seed.id,
    firstName: seed.firstName,
    lastName: seed.lastName,
    fullName: joinFullName(seed),
    nickname: seed.nickname ?? null,
    avatarUrl: seed.avatar ? avatar(seed.avatar) : null,
    showOnPublicRoster: seed.showOnPublicRoster ?? true,
    referralCode: seed.referralCode,
    onboardingStatus: seed.onboardingStatus,
    email: seed.email,
    contactNumber: seed.contactNumber,
    authMethod: seed.authMethod ?? "email",
  };
}

/** The three original demo customers, extended. `cust-ana` stays not started for the nudge demo. */
export const coreCustomers: CustomerProfile[] = [
  memberProfile({
    id: "cust-ana",
    firstName: "Ana",
    lastName: "Delgado",
    email: "ana@example.com",
    contactNumber: "+63 917 000 0001",
    authMethod: "google",
    referralCode: "ANADLG26",
    onboardingStatus: "not_started",
  }),
  memberProfile({
    id: "cust-ben",
    firstName: "Ben",
    lastName: "Santos",
    nickname: "Benny",
    avatar: 2,
    email: "ben@example.com",
    contactNumber: "+63 917 000 0002",
    referralCode: "BENSNT26",
    onboardingStatus: "completed",
  }),
  memberProfile({
    id: "cust-empty",
    firstName: "Empty",
    lastName: "Inbox",
    email: "empty@example.com",
    contactNumber: "+63 917 000 0003",
    referralCode: "EMPTYB26",
    onboardingStatus: "skipped",
  }),
];

export const communityMembers: CustomerProfile[] = [
  memberProfile({
    id: "cust-m-01",
    firstName: "Maria Clara",
    lastName: "Reyes",
    nickname: "Clara",
    avatar: 1,
    email: "clara.reyes@example.com",
    contactNumber: "+63 917 100 0001",
    authMethod: "google",
    referralCode: "CLARAR26",
    onboardingStatus: "completed",
  }),
  memberProfile({
    id: "cust-m-02",
    firstName: "Jose Miguel",
    lastName: "Tan",
    nickname: "Migs",
    email: "migs.tan@example.com",
    contactNumber: "+63 917 100 0002",
    referralCode: "MIGSTN26",
    onboardingStatus: "completed",
  }),
  memberProfile({
    id: "cust-m-03",
    firstName: "Patricia",
    lastName: "Lim",
    avatar: 3,
    email: "patricia.lim@example.com",
    contactNumber: "+63 917 100 0003",
    referralCode: "PATLIM26",
    onboardingStatus: "in_progress",
  }),
  memberProfile({
    id: "cust-m-04",
    firstName: "Carlo",
    lastName: "Mendoza",
    email: "carlo.mendoza@example.com",
    contactNumber: "+63 917 100 0004",
    showOnPublicRoster: false,
    referralCode: "CARLOM26",
    onboardingStatus: "completed",
  }),
  memberProfile({
    id: "cust-m-05",
    firstName: "Bea",
    lastName: "Villanueva",
    avatar: 4,
    email: "bea.villanueva@example.com",
    contactNumber: "+63 917 100 0005",
    authMethod: "google",
    referralCode: "BEAVIL26",
    onboardingStatus: "completed",
  }),
  memberProfile({
    id: "cust-m-06",
    firstName: "Rafael",
    lastName: "Cruz",
    nickname: "Raf",
    email: "raf.cruz@example.com",
    contactNumber: "+63 917 100 0006",
    referralCode: "RAFCRZ26",
    onboardingStatus: "skipped",
  }),
  memberProfile({
    id: "cust-m-07",
    firstName: "Isabel",
    lastName: "Garcia",
    avatar: 5,
    email: "isabel.garcia@example.com",
    contactNumber: "+63 917 100 0007",
    showOnPublicRoster: false,
    referralCode: "ISAGAR26",
    onboardingStatus: "completed",
  }),
  memberProfile({
    id: "cust-m-08",
    firstName: "Andrea",
    lastName: "Lopez",
    nickname: "Andi",
    avatar: 6,
    email: "andi.lopez@example.com",
    contactNumber: "+63 917 100 0008",
    referralCode: "ANDILP26",
    onboardingStatus: "completed",
  }),
  memberProfile({
    id: "cust-m-09",
    firstName: "Paolo",
    lastName: "Ramos",
    email: "paolo.ramos@example.com",
    contactNumber: "+63 917 100 0009",
    referralCode: "PAOLOR26",
    onboardingStatus: "not_started",
  }),
  memberProfile({
    id: "cust-m-10",
    firstName: "Kim",
    lastName: "Aquino",
    nickname: "Kimmy",
    avatar: 2,
    email: "kim.aquino@example.com",
    contactNumber: "+63 917 100 0010",
    authMethod: "google",
    referralCode: "KIMAQN26",
    onboardingStatus: "completed",
  }),
  memberProfile({
    id: "cust-m-11",
    firstName: "Luis",
    lastName: "Fernandez",
    email: "luis.fernandez@example.com",
    contactNumber: "+63 917 100 0011",
    referralCode: "LUISFZ26",
    onboardingStatus: "completed",
  }),
  memberProfile({
    id: "cust-m-12",
    firstName: "Trisha",
    lastName: "Navarro",
    nickname: "Trish",
    avatar: 3,
    email: "trisha.navarro@example.com",
    contactNumber: "+63 917 100 0012",
    referralCode: "TRISHN26",
    onboardingStatus: "in_progress",
  }),
];

function answers(partial: Partial<CustomerOnboardingAnswers>): CustomerOnboardingAnswers {
  return {
    goals: [],
    goalsOther: "",
    experienceLevel: null,
    interestClassIds: [],
    interestsOther: "",
    heardFrom: null,
    heardFromOther: "",
    updatedAt: "2026-09-10T02:00:00.000Z",
    ...partial,
  };
}

/** Keyed by customer id. Missing key = nothing saved yet. */
export const onboardingFixtures: Record<string, CustomerOnboardingAnswers> = {
  "cust-ben": answers({
    goals: ["STRENGTH", "COMMUNITY"],
    experienceLevel: "REGULAR",
    interestClassIds: ["class-calisthenics", "class-kickboxing"],
    heardFrom: "INSTAGRAM",
  }),
  "cust-empty": answers({ goals: ["STRESS_RELIEF"], updatedAt: "2026-09-02T02:00:00.000Z" }),
  "cust-m-01": answers({
    goals: ["FLEXIBILITY_MOBILITY", "POSTURE_CORE"],
    experienceLevel: "SOME",
    interestClassIds: ["class-pilates", "class-yoga"],
    heardFrom: "FRIEND",
  }),
  "cust-m-02": answers({
    goals: ["STRENGTH", "ENDURANCE"],
    experienceLevel: "ADVANCED",
    interestClassIds: ["class-calisthenics", "class-groundworks"],
    heardFrom: "EVENT",
  }),
  "cust-m-03": answers({
    goals: ["WEIGHT_MANAGEMENT", "OTHER"],
    goalsOther: "Train for a half marathon",
    experienceLevel: "SOME",
  }),
  "cust-m-04": answers({
    goals: ["STRESS_RELIEF"],
    experienceLevel: "NEW",
    interestClassIds: ["class-yoga"],
    heardFrom: "GOOGLE",
  }),
  "cust-m-05": answers({
    goals: ["FLEXIBILITY_MOBILITY", "COMMUNITY"],
    experienceLevel: "NEW",
    interestClassIds: ["class-pilates", "class-dance"],
    heardFrom: "FRIEND",
  }),
  "cust-m-06": answers({ goals: ["STRENGTH"], experienceLevel: "REGULAR" }),
  "cust-m-07": answers({
    goals: ["POSTURE_CORE"],
    experienceLevel: "REGULAR",
    interestClassIds: ["class-pilates"],
    heardFrom: "FACEBOOK",
  }),
  "cust-m-08": answers({
    goals: ["COMMUNITY", "STRESS_RELIEF"],
    experienceLevel: "SOME",
    interestClassIds: ["class-dance", "class-pilates"],
    interestsOther: "Aerial yoga",
    heardFrom: "FRIEND",
  }),
  "cust-m-10": answers({
    goals: ["ENDURANCE", "WEIGHT_MANAGEMENT"],
    experienceLevel: "REGULAR",
    interestClassIds: ["class-circuit", "class-kickboxing"],
    heardFrom: "TIKTOK",
  }),
  "cust-m-11": answers({
    goals: ["STRENGTH"],
    experienceLevel: "NEW",
    interestClassIds: ["class-bjj"],
    heardFrom: "OTHER",
    heardFromOther: "Office wellness fair",
  }),
  "cust-m-12": answers({
    goals: ["FLEXIBILITY_MOBILITY"],
    experienceLevel: "NEW",
    interestClassIds: ["class-yoga"],
  }),
};

export type ReferralFixture = { referredById: string | null; channel: ReferralChannel };

/** Sign-up attribution, keyed by the referred customer. */
export const referralFixtures: Record<string, ReferralFixture> = {
  "cust-m-01": { referredById: "cust-ben", channel: "CUSTOMER_LINK" },
  "cust-m-02": { referredById: null, channel: "STUDIO_QR" },
  "cust-m-05": { referredById: "cust-m-01", channel: "CUSTOMER_QR" },
  "cust-m-08": { referredById: "cust-m-01", channel: "CUSTOMER_LINK" },
  "cust-m-11": { referredById: null, channel: "STUDIO_LINK" },
};

/** Sign-up dates for the insights report (Manila mornings in 2026). */
export const signupDates: Record<string, string> = {
  "cust-ana": "2026-07-02T01:00:00.000Z",
  "cust-ben": "2026-06-18T01:00:00.000Z",
  "cust-empty": "2026-09-01T01:00:00.000Z",
  "cust-m-01": "2026-08-03T01:00:00.000Z",
  "cust-m-02": "2026-08-09T01:00:00.000Z",
  "cust-m-03": "2026-08-14T01:00:00.000Z",
  "cust-m-04": "2026-08-20T01:00:00.000Z",
  "cust-m-05": "2026-08-22T01:00:00.000Z",
  "cust-m-06": "2026-08-27T01:00:00.000Z",
  "cust-m-07": "2026-09-01T01:00:00.000Z",
  "cust-m-08": "2026-09-04T01:00:00.000Z",
  "cust-m-09": "2026-09-08T01:00:00.000Z",
  "cust-m-10": "2026-09-10T01:00:00.000Z",
  "cust-m-11": "2026-09-12T01:00:00.000Z",
  "cust-m-12": "2026-09-14T01:00:00.000Z",
};
