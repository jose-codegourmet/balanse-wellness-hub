import type { AdminStaff } from "@balanse/domain";

/** "Link to staff" for a coach profile with no staff account (legacy coaches).
 * A coach is always one staff member; only active staff without a coach profile are offered.
 * Uses POST /api/admin/staff/{staffId}/coach (`staff.manage`). Renders inside the coach
 * editor's <form>, so it submits from a button click rather than a nested form.
 */
export type CoachLinkStaffProps = {
  coachId: string;
  coachName: string;
  staff: Pick<AdminStaff, "id" | "name" | "email" | "status" | "coachId">[];
};
