export type StaffPhotoCardProps = {
  staffId?: string;
  name: string;
  avatarUrl?: string | null;
  canEdit: boolean;
  /** Uses the authenticated /me endpoint, without staff.manage or a caller-supplied target. */
  self?: boolean;
};
export const staffPhotoCardMeta = {
  purpose:
    "Private staff profile photo with immediate upload/replace/remove and initials fallback.",
  whenToUse:
    "Staff detail or My profile; create the staff record before uploading. Does not own a form value. Self-service is available to every active staff actor.",
  whenNotToUse: "Public coach portrait or arbitrary customer editing.",
  persistence:
    "API mint → signed PUT → confirm, JPG/PNG/WEBP up to 5 MiB. Saved independently of the account form. Failed uploads preserve the prior photo.",
} as const;
