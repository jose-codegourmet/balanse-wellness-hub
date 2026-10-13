import type { StaffPasswordFormValues } from "../staff-password-form/StaffPasswordForm.schema";

export type StaffInvitePageProps = {
  canResume?: boolean;
  defaultTokenType?: "invite" | "recovery";
  onSubmit: (
    input: StaffPasswordFormValues & { tokenHash?: string; tokenType?: "invite" | "recovery" },
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
};

export const staffInvitePageMeta = {
  purpose:
    "Staff password setup/reset: read the private fragment, verify the invite or recovery token on submission, and return to login.",
  whenToUse: "The /auth/set-password route for manually shared staff invite and reset links.",
  whenNotToUse:
    "Public reset requests or signup. A normal signed-in session does not authorize this flow.",
} as const;
