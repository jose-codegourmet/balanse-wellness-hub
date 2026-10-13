# Tasks: Class image uploads and Super Admin class delete

Status: implemented in the working tree on 2026-10-13, not yet committed. Unchecked items are follow-ups.

## BE

- [x] `POST /api/admin/class-images` (`postAdminClassImage`), `assertClassImageKey`, `class_image` purpose, `SIGNED_UPLOAD.classImageTypes`. Contract row WIRE-1303, `ADMIN_API_ACCESS` entry.
- [x] `DELETE /api/admin/classes/{id}` (`deleteAdminClass`) with 403 for non-Super-Admin, 409 `class_in_use`, `class.delete` audit. Contract row WIRE-1304, `ADMIN_API_ACCESS` entry with `superAdminOnly`, action `classes-delete`.
- [x] OpenAPI regenerated.
- [x] `docs/backend/api-routes.md` Classes section; `docs/backend/uploads.md` "Class cover and gallery images".
- [ ] Confirm the orphan-reap job covers `class_image` intents (`docs/backend/jobs.md`).

## FE

- [x] `ClassImagesInput` rewrite (+ `ClassImagesInput.meta.ts`, `Cover` story, `CLASS_IMAGE_MAX`, `CLASS_IMAGE_ASPECT`).
- [x] `useUploadAdminClassImage` (mint → PUT → confirm; skips PUT for Storybook `mock:` URLs), `useDeleteAdminClass`.
- [x] `ClassFormPage`: upload copy, slug sync, confirmed Delete class with `class.deleted` / `class.delete-blocked` / `class.delete-failed`.
- [x] `ClassListPage` page size 50.
- [x] `CLASS_IMAGE_LIBRARY` / `packages/domain/src/class-images.ts` removed.
- [x] Storybook: `mockClassFetcher` handles DELETE and the class-images mint/confirm; `mock-api-fetch-browser` routes `/api/admin/class-images`.
- [ ] `docs/screen-specs/admin/06-class-management.md`: uploads replace the library; delete rule.
- [ ] Remove or archive the unused `/assets/marketing/classes/*-hero.webp` files if nothing else references them (`docs/assets/manifest.json`).

## Files in this change

Shared files (also touched by other changes; split with `git add -p`): `packages/api/src/handlers/admin-catalogue.ts` (class handlers only), `packages/api/src/router.ts`, `packages/db/contracts/routes.ts`, `packages/db/contracts/openapi.json`, `packages/domain/src/admin-access.ts`, `packages/domain/src/contracts.ts` (`classImageTypes`), `packages/domain/src/toast-copy.ts`, `docs/backend/api-routes.md`.

- `apps/admin/src/components/balanse/class-images-input/**`
- `apps/admin/src/app/(dashboard)/classes/_components/**`
- `apps/admin/src/lib/query/mutations/classes.ts`
- `apps/admin/.storybook/mock-api-fetch-browser.ts`
- `packages/api/src/uploads.ts`
- `packages/api-client/src/classes.ts`
- `packages/domain/src/class-images.ts` (deleted), `packages/domain/src/index.ts`
- `docs/backend/uploads.md`
