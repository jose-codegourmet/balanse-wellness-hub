/**
 * # ProfileNameFields (#351, #352)
 *
 * First name + Last name (side by side from `sm`), optional Nickname with the
 * helper "Shown to other members on class rosters instead of your first
 * name.", and the live preview "Other members will see you as **<display
 * name>**" (`getDisplayName`) with a `UserAvatar`.
 *
 * Renders fields only — no `<form>`. It reads the surrounding react-hook-form
 * through `useFormContext`, so the parent form's values must include
 * `BasicProfileIdentityValues` (`firstName`, `lastName`, `nickname`). Used by
 * `BasicProfileForm` and the onboarding `OnboardingStepYouForm`, which both
 * validate with `basicProfileIdentitySchema`.
 *
 * Never shows the last name in the preview; that is the public display rule.
 */
export type ProfileNameFieldsProps = {
  avatarUrl: string | null;
  /** Initials tone seed (customer id). */
  seed?: string;
  className?: string;
};

export const profileNameFieldsMeta = {
  purpose: "Name + nickname fields with the public display-name preview.",
  whenToUse: "Inside a react-hook-form whose values include firstName, lastName and nickname.",
  whenNotToUse: "Outside a FormProvider, or on sign-up (no nickname there).",
} as const;
