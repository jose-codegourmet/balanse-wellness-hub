/**
 * Aggregate marketing insights (#354). Counts only — no names, emails, or ids.
 */
import type {
  ExperienceLevel,
  FitnessGoal,
  HeardFromSource,
  OnboardingStatus,
  ReferralChannel,
} from "./onboarding";

export type CountRow<T extends string> = { key: T; label: string; count: number };

export type MarketingInsights = {
  range: { from: string; to: string };
  signups: number;
  onboarding: Record<OnboardingStatus, number>;
  /** Sign-ups whose referral channel is set. */
  sharedLinkSignups: number;
  heardFrom: CountRow<HeardFromSource>[];
  /** De-duplicated, lowercased "Other" answers with counts (top 20). */
  heardFromOther: { text: string; count: number }[];
  /** Multi-select: counts are respondents per goal, not a share of 100%. */
  goals: CountRow<FitnessGoal>[];
  goalRespondents: number;
  experience: CountRow<ExperienceLevel>[];
  interests: { classId: string; label: string; active: boolean; count: number }[];
  referralChannels: CountRow<ReferralChannel | "NONE">[];
};

export type MarketingInsightsQuery = { from: string; to: string };
