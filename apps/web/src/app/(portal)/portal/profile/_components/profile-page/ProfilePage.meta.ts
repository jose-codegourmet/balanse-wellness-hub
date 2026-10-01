/**
 * Portal profile settings contract (FE-CUS-017, #351, #352).
 *
 * Shared shell (heading, `UserAvatar` identity summary, submenu) plus the
 * active section: Basic profile, About you, Account, Password, Policies.
 * `actions` are the customer self-service server actions passed from
 * `ProfileSectionRoute`; `about` carries onboarding answers, active classes
 * and the referral channel, loaded only for the About you section.
 */
export const profilePageMeta = {
  purpose: "Render the shared profile shell and the active account settings section.",
  whenToUse: "Use for the portal profile routes and their deep links.",
  whenNotToUse: "Do not use for public marketing profile previews.",
} as const;
