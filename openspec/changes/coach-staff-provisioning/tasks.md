# Tasks: Coaches are provisioned as staff

Status: implemented in the working tree on 2026-10-13, not yet committed. Unchecked items are follow-ups.

## BE

- [x] Migration `staff_coach_role_check_on_commit` (Prisma + `supabase/migrations`): deferred constraint trigger for INSERT, immediate check kept for UPDATE.
- [x] `packages/api/src/coach-profile.ts`: `parseNewCoachProfile`, `parseSpecialties`, `assertStaffCanCoach`, `coachRateValue`, `sendsRate`.
- [x] `POST /api/admin/coaches` requires `staffId`; audit metadata carries it.
- [x] `POST /api/admin/staff` accepts `newCoach`, creates the coach in the same transaction, rejects `coachId` + `newCoach`.
- [x] `DELETE /api/admin/coaches/{id}` with 409 `coach_in_use`; contract row (BE-038), `ADMIN_API_ACCESS` entry, OpenAPI regenerated.
- [x] `PATCH /api/admin/coaches/{id}` reads `defaultRatePhp`; `presentCoach` returns `defaultRatePhp`; `RATE_KEYS` strips it for unauthorized actors.
- [x] `ruleMessage` in `mapUnknownError`.
- [ ] `docs/backend/staff-coach-unification.md` §HTTP contract: `staffId` on coach create, `newCoach` on staff create, coach delete semantics, deferred trigger.
- [ ] `docs/backend/api-routes.md`: coaches table (DELETE) and staff create body.

## FE

- [x] `CoachStaffSource` and `CoachLinkStaff` (meta, schema/defaults where a form, stories) under `coach-form-page/`.
- [x] `coachStaffSourceSchema`, `coachNewFormSchema`, `coachNewPublicFormSchema`, `coachStaffSourceDefaultValues`; optional `shortBio`.
- [x] `CoachFormPage`: staff source on create, invite flow → `StaffInviteDialog` → photo tab, rate fields gated on `coach-rates-manage`, confirmed Delete coach with `coach.delete-blocked` / `coach.delete-failed` toasts, Link to staff for unlinked coaches.
- [x] `CoachListPage` uses `useSetCoachActive` + `coach.status-updated`.
- [x] `StaffDetailPage`: "Create a new coach profile" option (`NEW_COACH_PROFILE`), `useUpsertAdminStaff` creates/links accordingly; `useInviteCoach`, `useLinkCoachToStaff`, `useDeleteAdminCoach`.
- [x] `StaffInviteDialog` moved to `src/components/balanse/staff-invite-dialog/`.
- [x] `adminCoachPhotoUrl` in `resolveCoachPhotoSources`.
- [x] Toast ids `coach.status-updated`, `coach.deleted`, `coach.delete-blocked`, `coach.delete-failed`.
- [x] Storybook: `mockCoachFetcher` handles partial PATCH, defaults omitted rates, answers DELETE with 409; `CoachWithNoStaffAccount` fixture retargeted.
- [ ] `docs/screen-specs/admin/07-coach-management.md` and `03-staff-management.md`: provisioning paths, delete rule, rate-field gating.

## Files in this change

Shared files (also touched by other changes; split with `git add -p`): `packages/api/src/handlers/admin-catalogue.ts` (coach handlers only), `packages/api/src/router.ts`, `packages/db/contracts/routes.ts`, `packages/db/contracts/openapi.json`, `packages/domain/src/admin-access.ts`, `packages/domain/src/toast-copy.ts`.

- `apps/admin/src/app/(dashboard)/coaches/_components/**`
- `apps/admin/src/app/(dashboard)/staff/_components/staff-detail-page/StaffDetailPage.tsx`, `staff-list-page/StaffListPage.tsx`, `staff-account-actions/StaffAccountActions.tsx`
- `apps/admin/src/components/balanse/staff-invite-dialog/**` (moved from `staff/_components/staff-invite-dialog/`)
- `apps/admin/src/modules/admin/forms/coach/*`
- `apps/admin/src/lib/query/mutations/coaches.ts`, `mutations/staff.ts`
- `packages/api/src/coach-profile.ts`, `handlers/admin-people.ts`, `presenters.ts`, `errors.ts`
- `packages/api-client/src/coaches.ts`, `staff.ts`
- `packages/domain/src/assets.ts`
- `packages/db/prisma/migrations/20261013190000_staff_coach_role_check_on_commit/`, `supabase/migrations/20261013190000_staff_coach_role_check_on_commit.sql`
