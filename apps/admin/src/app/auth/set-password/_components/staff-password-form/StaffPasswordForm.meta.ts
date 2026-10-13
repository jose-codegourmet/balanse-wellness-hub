import type { StaffPasswordFormValues } from "./StaffPasswordForm.schema";

export const staffPasswordFormMeta = {
  purpose:
    "Collect and confirm a staff member's new password from a valid invite or recovery link.",
  whenToUse: "Only on the token-gated /auth/set-password route.",
  whenNotToUse: "Public signup, unauthenticated reset requests, or staff profile editing.",
} as const;
export type StaffPasswordFormProps = {
  onSubmit: (values: StaffPasswordFormValues) => Promise<void>;
};
