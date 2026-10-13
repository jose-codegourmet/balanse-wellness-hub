# Delta: FE admin screens

Base: `openspec/specs/fe-admin-screens.md` (requirements 1–21). Merge on archive; renumber if the base has grown.

## ADDED Requirements

23. Coach editor (`/coaches/new`, `/coaches/[coachId]`). Create starts with "Who is this coach?": existing staff (readable staff list required) or invite (`staff.manage` + `coaches.manage`, role selectable, Coach pre-selected). After an invite the `StaffInviteDialog` shows the link, then the editor continues on the photo tab. Existing coaches without a staff account show Link to staff when permitted. Financials are sent only with `coach-rates-manage`. Delete coach is a confirmed destructive action for `coaches-manage`; the 409 case toasts `coach.delete-blocked`. The coach list's Activate/Deactivate is a partial update with the `coach.status-updated` toast.
