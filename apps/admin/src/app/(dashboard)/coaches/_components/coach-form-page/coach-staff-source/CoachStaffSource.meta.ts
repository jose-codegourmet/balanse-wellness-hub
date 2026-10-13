import type { AdminStaff, AdminStaffRole } from "@balanse/domain";

/** "Who is this coach?" section of the new-coach form (a coach is always one staff member).
 * Existing: active staff without a coach profile. Invite: name, email, and role (built-in Coach
 * pre-selected, changeable). The coach name is prefilled from the person until edited.
 * Lives inside AdminForm with coachNewFormSchema / coachNewPublicFormSchema.
 */
export type CoachStaffSourceProps = {
  staff: Pick<AdminStaff, "id" | "name" | "email" | "status" | "coachId">[];
  roles: Pick<AdminStaffRole, "id" | "key" | "name" | "builtIn" | "status">[];
  /** `staff.manage`: may invite a new staff member. */
  canInvite: boolean;
  /** Staff list readable: may pick an existing staff member. */
  canPickStaff: boolean;
};
