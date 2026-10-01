import type {
  CustomerOnboardingAnswers,
  CustomerProfile,
  CustomerProfilePatch,
} from "@balanse/domain";

/** Server actions return a result instead of throwing so messages survive production builds. */
export type ActionResult<T> = { ok: true; value: T } | { ok: false; error: string };

export type OnboardingAnswersPatch = Partial<Omit<CustomerOnboardingAnswers, "updatedAt">>;

/**
 * Customer self-service writes used by the profile and the onboarding wizard.
 * Routes pass the server actions from `customer-self-service-actions.ts`;
 * stories pass `mockCustomerSelfServiceActions(customerId)`.
 */
export type CustomerProfileActions = {
  patchProfile: (patch: CustomerProfilePatch) => Promise<ActionResult<CustomerProfile>>;
  /** Cropped data URL from `AvatarUploader`, or null to remove the photo. */
  setAvatar: (avatar: { dataUrl: string } | null) => Promise<ActionResult<CustomerProfile>>;
};

export type CustomerOnboardingActions = CustomerProfileActions & {
  saveAnswers: (patch: OnboardingAnswersPatch) => Promise<ActionResult<CustomerOnboardingAnswers>>;
  complete: () => Promise<ActionResult<CustomerProfile>>;
  skip: () => Promise<ActionResult<CustomerProfile>>;
};
