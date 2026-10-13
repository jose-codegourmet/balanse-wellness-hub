import {
  type CustomerOnboardingAnswers,
  EXPERIENCE_LEVELS,
  FITNESS_GOALS,
  HEARD_FROM_SOURCES,
  ONBOARDING_OTHER_MAX,
} from "@balanse/domain";
import { requireCustomer, resolveActor } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { ok, readJson } from "../http";

function present(
  row: {
    goals: string[];
    goalsOther: string;
    experienceLevel: string | null;
    interests: Array<{ classId: string }>;
    interestsOther: string;
    heardFrom: string | null;
    heardFromOther: string;
    updatedAt: Date;
  } | null,
): CustomerOnboardingAnswers | null {
  if (!row) return null;
  return {
    goals: row.goals as CustomerOnboardingAnswers["goals"],
    goalsOther: row.goalsOther,
    experienceLevel: row.experienceLevel as CustomerOnboardingAnswers["experienceLevel"],
    interestClassIds: row.interests.map((interest) => interest.classId),
    interestsOther: row.interestsOther,
    heardFrom: row.heardFrom as CustomerOnboardingAnswers["heardFrom"],
    heardFromOther: row.heardFromOther,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function enumArray(
  value: unknown,
  allowed: readonly string[],
  field: string,
): string[] | undefined {
  if (value === undefined) return undefined;
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string" || !allowed.includes(item))
  ) {
    throw new ApiError(422, "validation_failed", "Validation failed.", {
      fields: { [field]: "Invalid value." },
    });
  }
  return [...new Set(value)];
}

function text(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.trim().length > ONBOARDING_OTHER_MAX) {
    throw new ApiError(422, "validation_failed", "Validation failed.", {
      fields: { [field]: `Must be at most ${ONBOARDING_OTHER_MAX} characters.` },
    });
  }
  return value.trim();
}

export async function getMyOnboarding(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const row = await deps.prisma.profileOnboarding.findUnique({
    where: { profileId: actor.userId },
    include: { interests: { select: { classId: true } } },
  });
  return ok({ onboarding: present(row) });
}

export async function patchMyOnboarding(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const body = await readJson(req);
  const goals = enumArray(body.goals, FITNESS_GOALS, "goals");
  const interestClassIds =
    body.interestClassIds === undefined
      ? undefined
      : Array.isArray(body.interestClassIds) &&
          body.interestClassIds.every((item) => typeof item === "string")
        ? [...new Set(body.interestClassIds)]
        : undefined;
  if (body.interestClassIds !== undefined && interestClassIds === undefined)
    throw new ApiError(422, "validation_failed", "Validation failed.", {
      fields: { interestClassIds: "Invalid value." },
    });
  const experienceLevel =
    body.experienceLevel === undefined
      ? undefined
      : body.experienceLevel === null
        ? null
        : typeof body.experienceLevel === "string" &&
            EXPERIENCE_LEVELS.includes(body.experienceLevel as never)
          ? body.experienceLevel
          : undefined;
  const heardFrom =
    body.heardFrom === undefined
      ? undefined
      : body.heardFrom === null
        ? null
        : typeof body.heardFrom === "string" && HEARD_FROM_SOURCES.includes(body.heardFrom as never)
          ? body.heardFrom
          : undefined;
  if (body.experienceLevel !== undefined && experienceLevel === undefined)
    throw new ApiError(422, "validation_failed", "Validation failed.", {
      fields: { experienceLevel: "Invalid value." },
    });
  if (body.heardFrom !== undefined && heardFrom === undefined)
    throw new ApiError(422, "validation_failed", "Validation failed.", {
      fields: { heardFrom: "Invalid value." },
    });
  const current = await deps.prisma.profileOnboarding.findUnique({
    where: { profileId: actor.userId },
  });
  const goalsOther = text(body.goalsOther, "goalsOther");
  const interestsOther = text(body.interestsOther, "interestsOther");
  const heardFromOther = text(body.heardFromOther, "heardFromOther");
  const row = await deps.prisma.profileOnboarding.upsert({
    where: { profileId: actor.userId },
    create: {
      profileId: actor.userId,
      goals: (goals ?? []) as never,
      goalsOther: goalsOther ?? "",
      experienceLevel: (experienceLevel ?? null) as never,
      interestsOther: interestsOther ?? "",
      heardFrom: (heardFrom ?? null) as never,
      heardFromOther: heardFromOther ?? "",
    },
    update: {
      ...(goals === undefined ? {} : { goals: goals as never }),
      ...(experienceLevel === undefined ? {} : { experienceLevel: experienceLevel as never }),
      ...(heardFrom === undefined ? {} : { heardFrom: heardFrom as never }),
      ...(goalsOther === undefined ? {} : { goalsOther }),
      ...(interestsOther === undefined ? {} : { interestsOther }),
      ...(heardFromOther === undefined ? {} : { heardFromOther }),
    },
  });
  if (interestClassIds !== undefined) {
    await deps.prisma.profileClassInterest.deleteMany({ where: { profileId: actor.userId } });
    if (interestClassIds.length)
      await deps.prisma.profileClassInterest.createMany({
        data: interestClassIds.map((classId) => ({ profileId: actor.userId, classId })),
      });
  }
  const saved = await deps.prisma.profileOnboarding.findUnique({
    where: { profileId: row.profileId },
    include: { interests: { select: { classId: true } } },
  });
  return ok({
    onboarding: present(saved),
    previousUpdatedAt: current?.updatedAt.toISOString() ?? null,
  });
}

async function mark(
  deps: ApiDeps,
  req: Request,
  field: "onboardingCompletedAt" | "onboardingSkippedAt",
) {
  const actor = requireCustomer(await resolveActor(deps, req));
  const profile = await deps.prisma.profile.update({
    where: { id: actor.userId },
    data: { [field]: deps.now() },
  });
  return ok({ id: profile.id, [field]: profile[field]?.toISOString() ?? null });
}
export const completeMyOnboarding = (deps: ApiDeps, req: Request) =>
  mark(deps, req, "onboardingCompletedAt");
export const skipMyOnboarding = (deps: ApiDeps, req: Request) =>
  mark(deps, req, "onboardingSkippedAt");
