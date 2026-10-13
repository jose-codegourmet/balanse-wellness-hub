# Change: Coaches are provisioned as staff (BE-055 follow-up, #289)

## Why

BE-055 unified staff and coaches (`coaches.staffMemberId`), and the Coach role requires a linked coach profile. In practice that rule could not be satisfied: `POST /api/admin/coaches` created profiles with no staff member, and inserting a staff member with the Coach role failed at the database (`coach_role_requires_linked_coach`) because the BEFORE INSERT trigger demanded a coach link that cannot exist before the staff row does. The coach editor also sent rate fields for every actor (rejected with 403 for Front Desk), had no way to delete a profile created by mistake, and the list's Activate/Deactivate re-submitted the whole coach including rates.

## What

- **A coach is always one staff member.** `/coaches/new` opens with a "Who is this coach?" section (`CoachStaffSource`): pick an active staff member who has no coach profile, or invite a new person (name, email, role with the built-in Coach role pre-selected). The coach name prefills from the person until edited.
- Existing route: `POST /api/admin/coaches` now requires `staffId` and refuses system, disabled or already-linked staff (`inactive_reference` / `already_linked` field errors).
- Invite path: `POST /api/admin/staff` accepts `newCoach` (profile fields; needs `coaches.manage`) and creates the staff row and the coach profile in one transaction, returning the invite link; `coachId` and `newCoach` together are rejected. The staff detail form gains a "Create a new coach profile" option next to "Link existing: <coach>".
- Legacy coaches with no staff account show **Link to staff** (`CoachLinkStaff`, `staff.manage`) in the Staff account panel of the coach editor.
- Migration `20261013190000_staff_coach_role_check_on_commit`: the INSERT-time Coach-role check moves to a `DEFERRABLE INITIALLY DEFERRED` constraint trigger (`staff_members_coach_role_linked`) so the link may be written after the insert in the same transaction; UPDATE keeps the immediate check.
- `DELETE /api/admin/coaches/{id}` (`coaches.manage`): hard delete only for a coach with no sessions, no class-change requests and no staff link; otherwise 409 `coach_in_use`. Marketing links are removed and the photo object retired. The editor shows a confirmed **Delete coach**; the blocked case toasts "deactivate instead".
- Rates: the editor sends `defaultRatePhp` / `rateType` only with `coach-rates-manage`; the API accepts `defaultRatePhp` (preferring it over legacy `defaultRate`) and the presenter returns `defaultRatePhp`. The list's Activate/Deactivate uses a partial PATCH (`useSetCoachActive`) with its own toast. Short bio is optional and stored as `""` when empty.
- Database rule errors surface as a one-line message (`ruleMessage`) instead of the Prisma driver text; `coach_role_requires_link` and `archived_role` have fixed copy.
- Admin-uploaded coach photos (`coach-photos/` keys) resolve to their public Storage URL in every role (`adminCoachPhotoUrl`), so uploaded portraits show on public and customer surfaces instead of the crest.
- `StaffInviteDialog` is promoted to `src/components/balanse/staff-invite-dialog/` because the coach editor now shows the invite link too.

## Decisions (Jose, 2026-10-13)

- No orphan coach profiles going forward. Legacy unlinked coaches stay valid until linked; the link action is offered, not forced.
- Inviting from the coach editor requires both `staff.manage` and `coaches.manage`; picking existing staff requires the staff list to be readable.
- Deleting a coach is reserved for mistakes. Anything with history is deactivated, never deleted.
- Teaching capability (`isCoach` / `coachId`) remains separate from the authorization role; a coach may be invited with a non-Coach role.

## Out of scope

Unlinking a coach from staff on the coach side (still on the staff detail), bulk import of coaches, and dropping the legacy `StaffRole` enum.

## Validation

- Prisma validate/generate; apply the migration on a branch and confirm a Coach-role staff insert with `newCoach` commits and one without a link still fails at commit
- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`, `pnpm secrets:scan`
- Manual as Super Admin: create a coach from existing staff; invite a new coach and copy the link; link a legacy coach; delete an unused coach; attempt to delete a scheduled coach (blocked). As Front Desk: save a coach without rate fields.
