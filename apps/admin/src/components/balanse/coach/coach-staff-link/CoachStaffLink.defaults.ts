import type { CoachStaffLinkProps, CoachStaffLinkStaff } from "./CoachStaffLink.schema";

export const coachStaffLinkRex: CoachStaffLinkStaff = {
  id: "staff-rex",
  name: "Rex Francis Regis",
};

export const coachStaffLinkDefaultValues: CoachStaffLinkProps = {
  staff: coachStaffLinkRex,
};

export const coachStaffLinkUnlinkedDefaultValues: CoachStaffLinkProps = {
  staff: null,
};
