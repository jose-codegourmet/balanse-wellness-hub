export type StaffAccountActionsProps = { staffId: string; staffName: string; disabled?: boolean };
export const staffAccountActionsMeta = {
  purpose: "Header Actions menu for manually shared staff invite and password reset links.",
  whenToUse: "Existing staff detail, gated by staff.manage. Disabled for inactive staff/roles.",
  whenNotToUse: "Public recovery or email delivery. Never stores tokens in query caches.",
} as const;
