/**
 * Onboarding answers (#343). Fixed lists in code with "Other" + free text.
 * OQ-3: no DOB, health, injury, or emergency-contact questions.
 * Values mirror the Prisma enums in `packages/db` (#344).
 */

export const FITNESS_GOALS = [
  "STRENGTH",
  "FLEXIBILITY_MOBILITY",
  "WEIGHT_MANAGEMENT",
  "STRESS_RELIEF",
  "POSTURE_CORE",
  "ENDURANCE",
  "COMMUNITY",
  "OTHER",
] as const;
export type FitnessGoal = (typeof FITNESS_GOALS)[number];

export const EXPERIENCE_LEVELS = ["NEW", "SOME", "REGULAR", "ADVANCED"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const HEARD_FROM_SOURCES = [
  "FRIEND",
  "INSTAGRAM",
  "FACEBOOK",
  "TIKTOK",
  "GOOGLE",
  "EVENT",
  "WALK_IN",
  "OTHER",
] as const;
export type HeardFromSource = (typeof HEARD_FROM_SOURCES)[number];

export const REFERRAL_CHANNELS = [
  "CUSTOMER_LINK",
  "CUSTOMER_QR",
  "STUDIO_LINK",
  "STUDIO_QR",
] as const;
export type ReferralChannel = (typeof REFERRAL_CHANNELS)[number];

export type OnboardingOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

export const FITNESS_GOAL_OPTIONS: readonly OnboardingOption<FitnessGoal>[] = [
  { value: "STRENGTH", label: "Get stronger" },
  { value: "FLEXIBILITY_MOBILITY", label: "Flexibility & mobility" },
  { value: "WEIGHT_MANAGEMENT", label: "Weight management" },
  { value: "STRESS_RELIEF", label: "Stress relief" },
  { value: "POSTURE_CORE", label: "Posture & core" },
  { value: "ENDURANCE", label: "Endurance" },
  { value: "COMMUNITY", label: "Meet people & community" },
  { value: "OTHER", label: "Other" },
];

export const EXPERIENCE_LEVEL_OPTIONS: readonly OnboardingOption<ExperienceLevel>[] = [
  {
    value: "NEW",
    label: "New to this",
    description: "Just getting started with regular exercise.",
  },
  {
    value: "SOME",
    label: "Some experience",
    description: "I've tried a few classes or train now and then.",
  },
  { value: "REGULAR", label: "Regular", description: "I train most weeks." },
  { value: "ADVANCED", label: "Advanced", description: "I train often and know my way around." },
];

export const HEARD_FROM_OPTIONS: readonly OnboardingOption<HeardFromSource>[] = [
  { value: "FRIEND", label: "A friend" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "GOOGLE", label: "Google search" },
  { value: "EVENT", label: "An event" },
  { value: "WALK_IN", label: "Walked past the studio" },
  { value: "OTHER", label: "Other" },
];

export const REFERRAL_CHANNEL_LABELS: Record<ReferralChannel, string> = {
  CUSTOMER_LINK: "Customer link",
  CUSTOMER_QR: "Customer QR",
  STUDIO_LINK: "Studio link",
  STUDIO_QR: "Studio QR",
};

export const ONBOARDING_OTHER_MAX = 120;

export type CustomerOnboardingAnswers = {
  goals: FitnessGoal[];
  goalsOther: string;
  experienceLevel: ExperienceLevel | null;
  interestClassIds: string[];
  interestsOther: string;
  heardFrom: HeardFromSource | null;
  heardFromOther: string;
  updatedAt: string | null;
};

export const EMPTY_ONBOARDING_ANSWERS: CustomerOnboardingAnswers = {
  goals: [],
  goalsOther: "",
  experienceLevel: null,
  interestClassIds: [],
  interestsOther: "",
  heardFrom: null,
  heardFromOther: "",
  updatedAt: null,
};

export type OnboardingStatus = "not_started" | "in_progress" | "skipped" | "completed";

export const ONBOARDING_STATUS_LABELS: Record<OnboardingStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  skipped: "Skipped",
  completed: "Completed",
};

export const ONBOARDING_STEPS = ["you", "goals", "interests", "heard-from", "done"] as const;
export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number];
/** Steps that collect answers (excludes `done`). */
export const ONBOARDING_INPUT_STEPS = ["you", "goals", "interests", "heard-from"] as const;
export type OnboardingInputStepId = (typeof ONBOARDING_INPUT_STEPS)[number];

export const ONBOARDING_STEP_LABELS: Record<OnboardingStepId, string> = {
  you: "You",
  goals: "Goals & experience",
  interests: "Interests",
  "heard-from": "How you found us",
  done: "Done",
};

export type OnboardingProfileFacts = {
  avatarUrl: string | null;
  nickname: string | null;
  lastName: string;
};

export type OnboardingCompletion = {
  done: OnboardingInputStepId[];
  missing: { step: OnboardingInputStepId; label: string }[];
  completedCount: number;
  total: number;
};

/** Progress for the portal-home nudge. "You" counts once a photo or nickname exists. */
export function onboardingCompletion(
  answers: CustomerOnboardingAnswers | null,
  profile: OnboardingProfileFacts,
): OnboardingCompletion {
  const a = answers ?? EMPTY_ONBOARDING_ANSWERS;
  const checks: { step: OnboardingInputStepId; ok: boolean; label: string }[] = [
    {
      step: "you",
      ok:
        Boolean(profile.lastName.trim()) && Boolean(profile.avatarUrl || profile.nickname?.trim()),
      label: profile.lastName.trim() ? "Add a photo or nickname" : "Add your last name",
    },
    {
      step: "goals",
      ok: a.goals.length > 0 && a.experienceLevel !== null,
      label: "Tell us your goals",
    },
    {
      step: "interests",
      ok: a.interestClassIds.length > 0 || Boolean(a.interestsOther.trim()),
      label: "Pick classes you're curious about",
    },
    { step: "heard-from", ok: a.heardFrom !== null, label: "Tell us how you found us" },
  ];
  const done = checks.filter((check) => check.ok).map((check) => check.step);
  return {
    done,
    missing: checks.filter((check) => !check.ok).map(({ step, label }) => ({ step, label })),
    completedCount: done.length,
    total: checks.length,
  };
}

/** First step still incomplete, or `done` when everything is answered. */
export function firstIncompleteOnboardingStep(completion: OnboardingCompletion): OnboardingStepId {
  return completion.missing[0]?.step ?? "done";
}

/** Prefill for "How did you hear about us?" from share attribution. */
export function heardFromForReferralChannel(
  channel: ReferralChannel | null | undefined,
): HeardFromSource | null {
  if (channel === "CUSTOMER_LINK" || channel === "CUSTOMER_QR") return "FRIEND";
  if (channel === "STUDIO_QR") return "EVENT";
  return null;
}

export function optionLabel<T extends string>(
  options: readonly OnboardingOption<T>[],
  value: T | null | undefined,
): string {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}
