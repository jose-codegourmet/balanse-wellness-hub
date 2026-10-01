/**
 * # BasicProfileForm (FE-CUS-017, #351)
 *
 * React Hook Form + `zodResolver` (`basicProfileFormSchema`): First name and
 * Last name (required), Nickname (optional, 2–30, trimmed) with the
 * "Other members will see you as …" preview (`ProfileNameFields`), email and
 * PH contact number.
 *
 * Save calls `onSave` with the widened `CustomerProfilePatch` (`firstName`,
 * `lastName`, `nickname`, `email`, `contactNumber`). The route wires it to
 * the `patchMyProfileAction` server action. Success / failure use the
 * `profile.saved` / `profile.save-failed` portal toasts. The photo and the
 * roster switch save separately (`AvatarUploader`, `RosterVisibilitySetting`).
 */
export const basicProfileFormMeta = {
  purpose: "Validate and save the customer's names, nickname, email and contact number.",
  whenToUse: "Use inside BasicProfileSection only.",
  whenNotToUse: "Do not embed this form in the profile page shell or use it on sign-up.",
} as const;
