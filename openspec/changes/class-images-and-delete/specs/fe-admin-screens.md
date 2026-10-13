# Delta: FE admin screens

Base: `openspec/specs/fe-admin-screens.md` (requirements 1–21). Merge on archive; renumber if the base has grown.

## MODIFIED Requirements

7. Forms use `react-hook-form` + `zodResolver`. Schema and `defaultValues` are colocated with form components or under `modules/admin/forms/` for shared form contracts. Constraints derive from `@balanse/domain` `FIELD_CONSTRAINTS`. Validation/server errors surface through `FieldError` / `FormMessage`. Writes go through typed query mutations and `notify.admin`. **Photo, class image and GCash QR uploads follow the signed-intent API contract; class images upload on pick and store public URLs.** Storybook may simulate upload states.

## ADDED Requirements

24. Class editor. Cover and gallery use `ClassImagesInput` (drop zone, picker, reorder, remove, advisory 16:9 hint, inline per-file errors). The slug follows the name until edited. Delete class is a confirmed destructive action shown only for `classes-delete` (Super Admin); 409 `class_in_use` toasts `class.delete-blocked`.
