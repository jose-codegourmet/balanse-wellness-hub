# Change: Class image uploads and Super Admin class delete (WIRE-1303 / WIRE-1304)

## Why

The class editor could only pick covers and galleries from a hard-coded list of nine generated Higgsfield assets (`CLASS_IMAGE_LIBRARY`), so the studio could not use its own photos. There was also no way to remove a class created by mistake; the only option was deactivation, which left test rows in the catalogue forever.

## What

- `ClassImagesInput` is now a real upload field (drop zone + file picker, JPG/PNG/WebP, 5 MiB each, up to 12 gallery images, single cover). Each file goes through `POST /api/admin/class-images` (mint → signed PUT → confirm) as soon as it is picked; the field value is the list of public HTTPS URLs stored in `heroImage` / `galleryImages`. The hint recommends 16:9 landscape at ≥1920×1080; off-ratio images get a soft "may be cropped" note. The library and `@balanse/domain` `class-images.ts` are removed.
- `POST /api/admin/class-images` (`classes.manage`) mints `marketing-assets/classes/<uuid>.<ext>` with `purpose = 'class_image'` and no `entityId` (a new class has no id yet); confirm returns `{ objectKey, url }`. Unconfirmed mints are reaped with other pending uploads. Removing an image from a class does not delete the object.
- `DELETE /api/admin/classes/{id}` is a hard delete for Super Admins only (`classes.manage` + `superAdminOnly`); other roles get 403. A class with sessions or bundle applicability returns 409 `class_in_use` with `details.sessions` / `details.bundles`. Marketing coach links and customer class interests cascade. One `class.delete` audit row.
- The class editor shows a confirmed **Delete class** for `classes-delete`; the blocked case toasts `class.delete-blocked` ("deactivate instead").
- Slug follows the name until the slug field is edited (create and edit); the edit copy warns that changing it breaks old links. The class list shows 50 rows per page so a new class stays in view.

## Decisions (Jose, 2026-10-13)

- Class images are public marketing assets (public bucket URL), unlike payment proofs and avatars.
- The aspect ratio is advisory; nothing is cropped or rejected server-side.
- Delete is Super Admin only and refuses anything with history, so booking history and bundle scope never change silently.

## Out of scope

Server-side image resizing or format conversion, reordering by drag, and deleting Storage objects when an image is removed from a class.

## Validation

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm guard:brand`, `pnpm secrets:scan`
- Manual as Super Admin: upload a cover and three gallery images, reorder, remove one, save, open the public class page; delete an unused class; attempt to delete a class with sessions (409). As Front Desk with `classes.manage`: no Delete class button, and a direct DELETE returns 403.
