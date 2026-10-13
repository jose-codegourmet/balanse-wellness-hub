import {
  EXPERIENCE_LEVEL_OPTIONS,
  type ExperienceLevel,
  FITNESS_GOAL_OPTIONS,
  type FitnessGoal,
  HEARD_FROM_OPTIONS,
  type HeardFromSource,
  type MarketingInsights,
  REFERRAL_CHANNEL_LABELS,
} from "@balanse/domain";
import { requireAdmin, resolveActor } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { ok, searchParams } from "../http";

const REFERRALS = ["CUSTOMER_LINK", "CUSTOMER_QR", "STUDIO_LINK", "STUDIO_QR"] as const;

function range(req: Request) {
  const params = searchParams(req);
  const fromRaw = params.get("from");
  const toRaw = params.get("to");
  const from = new Date(fromRaw ?? "");
  const to = new Date(toRaw ?? "");
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    throw new ApiError(400, "invalid_date_range", "from and to must be an ordered date range.");
  }
  return { from, to, raw: { from: fromRaw ?? "", to: toRaw ?? "" } };
}

function countRows<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
  counts: Map<T, number>,
) {
  return values.map((key) => ({ key, label: labels[key], count: counts.get(key) ?? 0 }));
}

/** Counts only: this handler never returns a profile id, name, email, or free-text identity. */
export async function getAdminMarketingInsights(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const { from, to, raw } = range(req);
  const profiles = await deps.prisma.profile.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: {
      referralChannel: true,
      onboardingCompletedAt: true,
      onboardingSkippedAt: true,
      onboarding: {
        select: {
          goals: true,
          experienceLevel: true,
          heardFrom: true,
          heardFromOther: true,
          interests: { select: { gymClass: { select: { id: true, name: true, active: true } } } },
        },
      },
    },
  });
  const heard = new Map<string, number>();
  const goals = new Map<string, number>();
  const experience = new Map<string, number>();
  const referrals = new Map<string, number>();
  const interests = new Map<string, { label: string; active: boolean; count: number }>();
  const other = new Map<string, number>();
  let goalRespondents = 0;
  const onboarding = { not_started: 0, in_progress: 0, skipped: 0, completed: 0 };
  for (const profile of profiles) {
    const status = profile.onboardingCompletedAt
      ? "completed"
      : profile.onboardingSkippedAt
        ? "skipped"
        : profile.onboarding
          ? "in_progress"
          : "not_started";
    onboarding[status] += 1;
    const channel = profile.referralChannel ?? "NONE";
    referrals.set(channel, (referrals.get(channel) ?? 0) + 1);
    const answers = profile.onboarding;
    if (!answers) continue;
    if (answers.heardFrom) heard.set(answers.heardFrom, (heard.get(answers.heardFrom) ?? 0) + 1);
    if (answers.heardFrom === "OTHER" && answers.heardFromOther.trim()) {
      const text = answers.heardFromOther.trim().toLocaleLowerCase();
      other.set(text, (other.get(text) ?? 0) + 1);
    }
    if (answers.goals.length) goalRespondents += 1;
    for (const goal of answers.goals) goals.set(goal, (goals.get(goal) ?? 0) + 1);
    if (answers.experienceLevel) {
      experience.set(answers.experienceLevel, (experience.get(answers.experienceLevel) ?? 0) + 1);
    }
    for (const interest of answers.interests) {
      const item = interests.get(interest.gymClass.id) ?? {
        label: interest.gymClass.name,
        active: interest.gymClass.active,
        count: 0,
      };
      item.count += 1;
      interests.set(interest.gymClass.id, item);
    }
  }
  const insight: MarketingInsights = {
    range: raw,
    signups: profiles.length,
    onboarding,
    sharedLinkSignups: REFERRALS.reduce((total, key) => total + (referrals.get(key) ?? 0), 0),
    heardFrom: countRows(
      HEARD_FROM_OPTIONS.map((item) => item.value),
      Object.fromEntries(HEARD_FROM_OPTIONS.map((item) => [item.value, item.label])) as Record<
        HeardFromSource,
        string
      >,
      heard as Map<HeardFromSource, number>,
    ),
    heardFromOther: [...other.entries()]
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count || a.text.localeCompare(b.text))
      .slice(0, 20),
    goals: countRows(
      FITNESS_GOAL_OPTIONS.map((item) => item.value),
      Object.fromEntries(FITNESS_GOAL_OPTIONS.map((item) => [item.value, item.label])) as Record<
        FitnessGoal,
        string
      >,
      goals as Map<FitnessGoal, number>,
    ),
    goalRespondents,
    experience: countRows(
      EXPERIENCE_LEVEL_OPTIONS.map((item) => item.value),
      Object.fromEntries(
        EXPERIENCE_LEVEL_OPTIONS.map((item) => [item.value, item.label]),
      ) as Record<ExperienceLevel, string>,
      experience as Map<ExperienceLevel, number>,
    ),
    interests: [...interests.entries()]
      .map(([classId, value]) => ({ classId, ...value }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    referralChannels: [
      ...REFERRALS.map((key) => ({
        key,
        label: REFERRAL_CHANNEL_LABELS[key],
        count: referrals.get(key) ?? 0,
      })),
      { key: "NONE" as const, label: "No shared link", count: referrals.get("NONE") ?? 0 },
    ],
  };
  return ok(insight);
}
