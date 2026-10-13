# Delta: Staff roles and permissions

Base: `openspec/specs/staff-roles-and-permissions.md` (requirements 1–17). Merge on archive.

## MODIFIED Requirements

4. Teaching capability stays `isCoach` / `coachId` from the staff↔coach link. The Coach role requires that link; it does not replace it. **A coach profile is always created for an existing staff member or together with a new one; the database verifies the Coach-role link at commit for inserts and immediately for role changes.**

## ADDED Requirements

18. Coach provisioning. `POST /api/admin/coaches` requires `staffId` (active, non-system staff without a coach profile). `POST /api/admin/staff` may carry `newCoach` to create the profile in the same transaction (needs `coaches.manage`); `coachId` and `newCoach` are mutually exclusive. The staff detail form offers "Create a new coach profile" or "Link existing: <coach>"; the coach editor offers existing staff or an invite with the Coach role pre-selected, then shows the invite link. Legacy coaches without a staff account can be linked from the coach editor with `staff.manage`.
19. Coach deletion. `DELETE /api/admin/coaches/{id}` (`coaches.manage`) succeeds only for a coach with no sessions, no class-change requests and no staff link; otherwise 409 `coach_in_use` and staff deactivate the coach instead. Rate fields are sent only by actors with `coach_rates.manage`; activation toggles are partial updates that never resend rates.
