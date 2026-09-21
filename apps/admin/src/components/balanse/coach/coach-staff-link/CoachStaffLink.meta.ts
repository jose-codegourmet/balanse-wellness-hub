export type CoachStaffLinkStaff = {
  id: string;
  name: string;
};

export type CoachStaffLinkProps = {
  staff: CoachStaffLinkStaff | null;
  className?: string;
};
