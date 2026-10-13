export const staffInviteDialogMeta = {
  purpose:
    "Show a newly generated staff invite or password reset link for manual sharing, without sending email.",
  whenToUse:
    "After adding staff (including inviting a new coach from /coaches/new), or as the clipboard fallback for the staff table invite/reset cells.",
  whenNotToUse: "Public customer registration or unauthenticated reset requests.",
} as const;

export type StaffInviteDialogProps = {
  staffName: string;
  inviteUrl: string | null;
  kind?: "invite" | "reset";
  onClose: () => void;
};
