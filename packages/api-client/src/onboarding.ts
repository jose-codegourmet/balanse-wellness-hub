import type { CustomerOnboardingAnswers, CustomerProfile } from "@balanse/domain";
import type { ApiFetcher } from "./classes";

export type OnboardingPatch = Partial<Omit<CustomerOnboardingAnswers, "updatedAt">>;
export const getMyOnboarding = (fetcher: ApiFetcher) =>
  fetcher<{ onboarding: CustomerOnboardingAnswers | null }>("/api/me/onboarding");
export const saveMyOnboarding = (fetcher: ApiFetcher, patch: OnboardingPatch) =>
  fetcher<{ onboarding: CustomerOnboardingAnswers | null }>("/api/me/onboarding", {
    method: "PATCH",
    body: patch,
  });
export const completeMyOnboarding = (fetcher: ApiFetcher) =>
  fetcher<Pick<CustomerProfile, "id"> & { onboardingCompletedAt: string | null }>(
    "/api/me/onboarding/complete",
    { method: "POST" },
  );
export const skipMyOnboarding = (fetcher: ApiFetcher) =>
  fetcher<Pick<CustomerProfile, "id"> & { onboardingSkippedAt: string | null }>(
    "/api/me/onboarding/skip",
    { method: "POST" },
  );
