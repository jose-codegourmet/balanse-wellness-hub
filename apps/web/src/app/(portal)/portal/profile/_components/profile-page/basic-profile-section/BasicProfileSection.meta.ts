/**
 * # BasicProfileSection (FE-CUS-017, #351)
 *
 * The `/portal/profile` section: photo (`AvatarUploader`, saved on its own),
 * the "Add your last name to complete your profile." prompt for legacy
 * single-word names, `BasicProfileForm` (names, nickname + preview, email,
 * contact) and the Privacy sub-section (`RosterVisibilitySetting`).
 *
 * `actions` are the customer self-service server actions passed down from
 * the route (`customerProfileServerActions`); stories pass
 * `mockCustomerSelfServiceActions(customerId)`. Identity changes refresh the
 * route so the portal header avatar and name update.
 */
export const basicProfileSectionMeta = {
  purpose: "Edit the customer's photo, names, nickname, contact details and roster visibility.",
  whenToUse: "Use inside ProfilePage for the basic section.",
  whenNotToUse: "Do not use for authentication credentials or onboarding answers.",
} as const;
